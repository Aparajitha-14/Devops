type DecodedSignature = {
  buffer: Buffer;
  extension: string;
  mimeType: string;
};

function getExtensionFromMimeType(mimeType: string) {
  if (mimeType.includes("png")) return "png";
  if (mimeType.includes("jpeg") || mimeType.includes("jpg")) return "jpg";
  if (mimeType.includes("webp")) return "webp";
  return "bin";
}

export function decodeSignatureBlob(signature: unknown): DecodedSignature | null {
  if (!signature) {
    return null;
  }

  if (Buffer.isBuffer(signature)) {
    return {
      buffer: signature,
      extension: "png",
      mimeType: "image/png",
    };
  }

  if (
    typeof signature === "object" &&
    signature !== null &&
    "type" in signature &&
    "data" in signature &&
    (signature as { type?: string }).type === "Buffer" &&
    Array.isArray((signature as { data?: unknown[] }).data)
  ) {
    return {
      buffer: Buffer.from((signature as { data: number[] }).data),
      extension: "png",
      mimeType: "image/png",
    };
  }

  if (typeof signature !== "string") {
    return null;
  }

  const trimmedSignature = signature.trim();
  if (!trimmedSignature) {
    return null;
  }

  const dataUrlMatch = trimmedSignature.match(/^data:([-\w.+/]+);base64,(.+)$/);

  if (dataUrlMatch?.[2]) {
    const mimeType = dataUrlMatch[1] || "image/png";
    return {
      buffer: Buffer.from(dataUrlMatch[2], "base64"),
      extension: getExtensionFromMimeType(mimeType),
      mimeType,
    };
  }

  const looksLikeBase64 = /^[A-Za-z0-9+/=\r\n]+$/.test(trimmedSignature);
  if (looksLikeBase64) {
    return {
      buffer: Buffer.from(trimmedSignature, "base64"),
      extension: "png",
      mimeType: "image/png",
    };
  }

  return {
    buffer: Buffer.from(trimmedSignature),
    extension: "bin",
    mimeType: "application/octet-stream",
  };
}

export function sanitizeFileSegment(value: string) {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "signature";
}
