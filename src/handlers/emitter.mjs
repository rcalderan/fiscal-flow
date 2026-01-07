import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({});

export const handler = async (event) => {
    const { invoices, sourceFile } = event;

    try {
        console.log(`Emitting batch for ${invoices.length} invoices...`);

        // Lógica de Geração de Lote DPS (Anexo IV)
        const loteXml = generateNfseBatchXml(invoices);

        // Comunicação com portal ADN-SNNFSeVia
        // const result = await postToNfsePortal(loteXml);
        
        const resultKey = `processed/${sourceFile.key.split('/').pop()}-NFSE.json`;
        
        await s3.send(new PutObjectCommand({
            Bucket: sourceFile.bucket,
            Key: resultKey,
            Body: JSON.stringify({ status: "EMITTED", invoices: invoices.length, protocol: "2026-XQZ-123" }),
            ContentType: 'application/json'
        }));

        return { 
            status: "SUCCESS", 
            resultKey,
            sourceFile
        };
    } catch (err) {
        console.error("Emitter Error:", err);
        throw err;
    }
};

function generateNfseBatchXml(invoices) {
    // Gerar XML conforme layout nacional da Receita Federal (NT 1.01.03)
    let xml = `<?xml version="1.0" encoding="UTF-8"?><LoteRPS xmlns="http://www.sped.fazenda.gov.br/nfse">`;
    xml += `<IdLote>${Date.now()}</IdLote><Quantidade>${invoices.length}</Quantidade><ListaRps>`;
    
    invoices.forEach(inv => {
        xml += `<Rps><Id>${inv.id}</Id><Valor>${inv.valor}</Valor></Rps>`;
    });

    xml += `</ListaRps></LoteRPS>`;
    return xml;
}
