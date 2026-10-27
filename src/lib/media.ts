export const mediaUrl = (storagePath: string | null | undefined) =>
  storagePath ? `/api/media/${storagePath.split("/").map(encodeURIComponent).join("/")}` : null;
