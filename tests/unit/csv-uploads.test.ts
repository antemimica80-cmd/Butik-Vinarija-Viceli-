import { describe, expect, it } from "vitest";
import { parseCsv, csvObjects, toCsv } from "@/lib/csv";
import { sniff, dimensions } from "@/lib/uploads";

describe("CSV", () => {
  it("handles quotes, commas, newlines and BOM", () => {
    const rows = parseCsv('﻿name,note\n"Matuško","Potomje, ""Dingač""\nline 2"\nBire,Grk\n');
    expect(rows).toEqual([["name", "note"], ["Matuško", 'Potomje, "Dingač"\nline 2'], ["Bire", "Grk"]]);
  });
  it("detects semicolon delimiters (common in Croatian Excel exports)", () => {
    expect(csvObjects("Name;Town\nToreta;Smokvica")).toEqual([{ name: "Toreta", town: "Smokvica" }]);
  });
  it("round-trips", () => {
    const data = [["a", "b,c"], ['d"e', "f"]];
    expect(parseCsv(toCsv(data))).toEqual(data);
  });
});

describe("upload sniffing", () => {
  it("identifies files by magic bytes, not by name", () => {
    const png = Buffer.alloc(32);
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(png);
    png.writeUInt32BE(640, 16); png.writeUInt32BE(480, 20);
    expect(sniff(png)?.mime).toBe("image/png");
    expect(dimensions(png, "image/png")).toEqual({ width: 640, height: 480 });
    expect(sniff(Buffer.from("%PDF-1.7 ..."))?.mime).toBe("application/pdf");
    expect(sniff(Buffer.from("<svg onload=alert(1)>"))).toBeNull();
    expect(sniff(Buffer.from("<?php echo 1; ?>"))).toBeNull();
  });
});
