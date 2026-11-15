export class ScreenShareService {
  private static stream: MediaStream | null = null;
  private static captureTimer: number | null = null;
  private static hiddenCanvas: HTMLCanvasElement | null = null;
  private static hiddenVideo: HTMLVideoElement | null = null;
  private static activeTicketId: string | null = null;
  private static activeApiBase: string | null = null;

  static async startSharing(
    onEnded: () => void,
    onError: (err: Error) => void
  ): Promise<MediaStream | null> {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        throw new Error('Screen sharing is not supported in this browser environment.');
      }

      this.stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      const track = this.stream.getVideoTracks()[0];
      if (track) {
        track.onended = () => {
          this.stopSharing();
          onEnded();
        };
      }

      return this.stream;
    } catch (err: unknown) {
      onError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  }

  static stopSharing() {
    this.stopFrameBroadcaster();
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
  }

  static isSharing(): boolean {
    return this.stream !== null && this.stream.active;
  }

  static getStream(): MediaStream | null {
    return this.stream;
  }

  /**
   * Periodically captures frames from the active screen MediaStream and sends them
   * to the backend so the platform admin / tutor can see the live shared screen.
   */
  static startFrameBroadcaster(
    ticketId: string,
    apiBase: string,
    publicKey?: string
  ) {
    if (!this.stream || !this.stream.active) return;

    this.activeTicketId = ticketId;
    this.activeApiBase = apiBase;

    if (!this.hiddenVideo) {
      this.hiddenVideo = document.createElement('video');
      this.hiddenVideo.muted = true;
      this.hiddenVideo.playsInline = true;
      this.hiddenVideo.style.display = 'none';
      document.body.appendChild(this.hiddenVideo);
    }
    this.hiddenVideo.srcObject = this.stream;
    this.hiddenVideo.play().catch(() => {});

    if (!this.hiddenCanvas) {
      this.hiddenCanvas = document.createElement('canvas');
    }

    const broadcastFrame = async () => {
      if (!this.stream || !this.stream.active || !this.hiddenVideo || !this.hiddenCanvas) {
        this.stopFrameBroadcaster();
        return;
      }

      if (this.hiddenVideo.videoWidth > 0 && this.hiddenVideo.videoHeight > 0) {
        // Downscale to max 960px width for fast 600ms delivery & low bandwidth usage
        const maxDim = 960;
        const scale = Math.min(1, maxDim / this.hiddenVideo.videoWidth);
        const w = Math.round(this.hiddenVideo.videoWidth * scale);
        const h = Math.round(this.hiddenVideo.videoHeight * scale);

        this.hiddenCanvas.width = w;
        this.hiddenCanvas.height = h;
        const ctx = this.hiddenCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(this.hiddenVideo, 0, 0, w, h);
          const frameData = this.hiddenCanvas.toDataURL('image/jpeg', 0.65);

          try {
            await fetch(`${apiBase}/api/v1/support/tickets/${encodeURIComponent(ticketId)}/screen-frame`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(publicKey ? { 'X-Public-Key': publicKey } : {}),
              },
              body: JSON.stringify({
                frame: frameData,
                active: true,
                sender: 'learner',
              }),
            });
          } catch {
            // Silently retry next frame
          }
        }
      }
    };

    if (this.captureTimer) clearInterval(this.captureTimer);
    // Broadcast a frame every 600ms for smooth live updates
    this.captureTimer = window.setInterval(broadcastFrame, 600);
    // Initial frame
    setTimeout(broadcastFrame, 200);
  }

  static stopFrameBroadcaster(ticketId?: string, apiBase?: string) {
    if (this.captureTimer) {
      clearInterval(this.captureTimer);
      this.captureTimer = null;
    }

    const targetTicket = ticketId || this.activeTicketId;
    const targetBase = apiBase || this.activeApiBase;

    if (targetTicket && targetBase) {
      fetch(`${targetBase}/api/v1/support/tickets/${encodeURIComponent(targetTicket)}/screen-frame`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: false, frame: null, sender: 'learner' }),
      }).catch(() => {});
    }

    if (this.hiddenVideo) {
      this.hiddenVideo.srcObject = null;
    }

    this.activeTicketId = null;
    this.activeApiBase = null;
  }
}
