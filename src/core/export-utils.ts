/**
 * Export an array of objects to a downloadable CSV file.
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns?: { key: keyof T; header: string }[]
) {
  if (!data || data.length === 0) return;

  const cols =
    columns ||
    Object.keys(data[0]).map((key) => ({
      key: key as keyof T,
      header: key.replace(/_/g, " ").toUpperCase(),
    }));

  const headerRow = cols.map((c) => `"${c.header.replace(/"/g, '""')}"`).join(",");

  const rows = data.map((row) => {
    return cols
      .map((c) => {
        const val = row[c.key];
        const stringVal =
          val == null
            ? ""
            : typeof val === "object"
            ? JSON.stringify(val)
            : String(val);
        return `"${stringVal.replace(/"/g, '""')}"`;
      })
      .join(",");
  });

  const csvContent = [headerRow, ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export interface VCardContact {
  business_name: string;
  contact_person?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  category?: string | null;
  address?: string | null;
  lead_score?: number | null;
}

/**
 * Export an array of leads to a standard .vcf (vCard 3.0) file for 1-tap import
 * into phone contacts (Android, iPhone, Google Contacts).
 */
export function exportToVCard(contacts: VCardContact[], filename: string) {
  if (!contacts || contacts.length === 0) return;

  const vcards = contacts.map((c) => {
    const rawPhone = c.whatsapp || c.phone || "";
    const cleanPhone = rawPhone.replace(/[^\d+]/g, "");
    const fn = c.contact_person
      ? `${c.contact_person} (${c.business_name})`
      : c.business_name;

    const lines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${fn.replace(/;/g, " ")}`,
      `ORG:${c.business_name.replace(/;/g, " ")}`,
    ];

    if (c.category) lines.push(`TITLE:${c.category.replace(/;/g, " ")}`);
    if (cleanPhone) lines.push(`TEL;TYPE=CELL,VOICE:${cleanPhone}`);
    if (c.email) lines.push(`EMAIL;TYPE=WORK:${c.email.trim()}`);
    if (c.address) lines.push(`ADR;TYPE=WORK:;;${c.address.replace(/;/g, " ")};;;;`);
    lines.push(`NOTE:LANGRATIA CRM Lead${c.lead_score ? ` (Score: ${c.lead_score})` : ""}`);
    lines.push("END:VCARD");

    return lines.join("\r\n");
  });

  const vcfContent = vcards.join("\r\n\r\n");
  const blob = new Blob([vcfContent], { type: "text/vcard;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0, 10)}.vcf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
