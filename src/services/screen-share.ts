export class ScreenShareService {
  private static stream: MediaStream | null = null;

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
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
  }

  static isSharing(): boolean {
    return this.stream !== null && this.stream.active;
  }
}
