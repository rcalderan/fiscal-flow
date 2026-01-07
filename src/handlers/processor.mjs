import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({});

export const handler = async (event) => {
    // S3 EventBridge pattern
    const bucket = event.detail.bucket.name;
    const key = event.detail.object.key;

    try {
        const response = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
        const content = await response.Body.transformToString();

        // Detailed parsing logic based on Anexo IV
        const invoices = parseBackup(content);
        
        return {
            sourceFile: { bucket, key },
            invoices: invoices,
            totalValue: invoices.reduce((acc, inv) => acc + inv.valor, 0),
            approvalRequired: invoices.length > 50 // Exemplo: requer aprovação se mais de 50 notas
        };
    } catch (err) {
        console.error("Processor Error:", err);
        throw err;
    }
};

function parseBackup(content) {
    // NT 1.01.03 (IBS/CBS) - Mocking the extraction of Anexo IV fields
    // Expecting JSON for simulation purposes, but in real life would be fixed-width or XML
    try {
        const data = JSON.parse(content);
        return data.map(item => ({
            id: item.id || `INV-${Math.random().toString(36).substr(2, 9)}`,
            valor: parseFloat(item.valor) || 0,
            servico: item.servico || "Serviços Gerais",
            tomador: item.tomador || "Consumidor Final"
        }));
    } catch (e) {
        console.warn("Content is not JSON, returning empty invoice list.");
        return [];
    }
}
//     // Retorno mockado conforme plano
//     return [
//         { id: "001", valor: 150.00, tomador: "CLIENTE A" },
//         { id: "002", valor: 300.00, tomador: "CLIENTE B" }
//     ];
// }
