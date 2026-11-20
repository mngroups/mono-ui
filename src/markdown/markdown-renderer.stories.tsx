import type { Meta, StoryObj } from "@storybook/react-vite";

import { MarkdownRenderer } from "./markdown-renderer.js";

const SUMMARY = `## Ringkasan produksi minggu ini

Produksi **naik 4%** dibanding minggu lalu, terutama dari *Site A*.

- Fuel ratio stabil di 1,32 L/ton
- 2 unit HD dalam perbaikan terjadwal
- Curah hujan 38 mm, 6 jam operasi hilang

| Site | Plan (ton) | Aktual (ton) | Pencapaian |
| --- | ---: | ---: | ---: |
| Site A | 12.000 | 12.640 | 105% |
| Site B | 9.500 | 9.120 | 96% |
| Site C | 7.200 | 6.980 | 97% |
`;

const meta = {
  title: "Components/MarkdownRenderer",
  component: MarkdownRenderer,
  parameters: {
    docs: { importPath: 'import { MarkdownRenderer } from "@mono/ui/markdown";' },
  },
  args: { content: SUMMARY },
  argTypes: { content: { control: "text" } },
} satisfies Meta<typeof MarkdownRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Headings h1-h5, paragraphs, emphasis, ordered and unordered lists. */
export const Typography: Story = {
  args: {
    content: `# Laporan Harian Site A

## Operasional

### Shift pagi

Hauling berjalan normal. Antrean di *crusher* sempat **25 menit** pukul 09.00.

1. Cek tekanan ban HD-07
2. Isi fuel EX-02 sebelum shift malam
3. Kirim foto patok batas ke kontraktor

#### Catatan

- Jalan hauling KM 3 licin setelah hujan
  - Grader dijadwalkan pukul 13.00

##### Dibuat otomatis oleh asisten operasi
`,
  },
};

/** GitHub-flavoured tables scroll sideways inside their own frame when they are too wide. */
export const WideTable: Story = {
  args: {
    content: `| Unit | Kontraktor | Site | Jam operasi | Fuel (L) | Ton | Fuel ratio | Status |
| --- | --- | --- | ---: | ---: | ---: | ---: | --- |
| HD-01 | PT Bara | Site A | 18 | 412 | 1.240 | 0,33 | Beroperasi |
| HD-02 | PT Bara | Site A | 17 | 388 | 1.180 | 0,33 | Beroperasi |
| EX-01 | PT Tambang | Site B | 20 | 296 | 2.410 | 0,12 | Standby |
| EX-02 | PT Karya | Site C | 0 | 0 | 0 | - | Perbaikan |
`,
  },
};

/** Inline code, fenced code blocks (scrollable), block quotes and links. */
export const CodeQuotesAndLinks: Story = {
  args: {
    content: `Gunakan filter \`site=A\` untuk melihat data Site A saja.

\`\`\`
GET /api/production?site=A&from=2026-11-01&to=2026-11-20
\`\`\`

> Target bulan ini 45.000 ton. Sisa 11 hari kerja.

Detail lengkap ada di [dashboard produksi](https://example.com/produksi).
`,
  },
};

/** Long unbroken text and URLs wrap instead of widening the container. */
export const LongContent: Story = {
  args: {
    content: `Lampiran: https://storage.example.com/site-a/laporan/2026/11/20/laporan-harian-produksi-dan-fuel-site-a-shift-pagi.pdf

KodeUnitSangatPanjangTanpaSpasiHD0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ`,
  },
};

/** A fenced ```chart block renders as a chart (see Chart Renderer for the format). */
export const WithChart: Story = {
  args: {
    content: [
      "## Produksi per site",
      "",
      "Pencapaian minggu ini terhadap plan:",
      "",
      "```chart",
      "type: bar",
      "Site A | plan=12000 | aktual=12640",
      "Site B | plan=9500 | aktual=9120",
      "Site C | plan=7200 | aktual=6980",
      "```",
    ].join("\n"),
  },
};
