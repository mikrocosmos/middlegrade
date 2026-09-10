import { afterEach, describe, expect, it, vi } from "vitest";
import { request } from "@/lib/api";

describe("request FormData", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends FormData without a JSON content-type", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const form = new FormData();
    form.append("id", "10");

    await request("/homework/operations/create", {
      method: "POST",
      body: form,
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;

    expect(init.body).toBeInstanceOf(FormData);
    expect(init.headers).toBeUndefined();
  });
});
