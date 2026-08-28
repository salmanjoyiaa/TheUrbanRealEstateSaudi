export async function reactPdfToBuffer(
  render: () => Promise<Buffer | NodeJS.ReadableStream>
): Promise<Buffer> {
  const output = await render();
  if (Buffer.isBuffer(output)) {
    return output;
  }
  const arrayBuffer = await new Response(output as unknown as BodyInit).arrayBuffer();
  return Buffer.from(arrayBuffer);
}
