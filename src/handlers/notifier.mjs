import { S3Client, CopyObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const s3 = new S3Client({});
const ses = new SESClient({});

export const handler = async (event) => {
    const { type, data, error, token } = event;

    switch (type) {
        case "WAIT_APPROVAL":
            await handleApprovalRequest(data, token);
            break;
        case "SUCCESS":
            await handleSuccess(data);
            break;
        case "FAILED":
            await handleFailure(error);
            break;
    }
};

async function handleApprovalRequest(data, token) {
    // Envia e-mail com Task Token para a Step Function
    const adminEmail = process.env.ADMIN_EMAIL || "admin@costumerental.com";
    const message = `Deseja aprovar a emissão de ${data.invoices.length} notas no valor total de R$ ${data.totalValue}? Token: ${token}`;
    await ses.send(new SendEmailCommand({
        Destination: { ToAddresses: [adminEmail] },
        Message: {
            Body: { Text: { Data: message } },
            Subject: { Data: "FiscalFlow: Aguardando Aprovação Manual" }
        },
        Source: adminEmail
    }));
}

async function handleSuccess(data) {
    const { sourceFile } = data;
    // Move arquivo de backup para pasta 'processed'
    await moveFile(sourceFile.bucket, sourceFile.key, `processed/${sourceFile.key.split('/').pop()}`);
}

async function handleFailure(error) {
    // Lógica para mover para 'failed' e notificar erro crítico
    console.error("Critical Failure in Pipeline:", error);
}

async function moveFile(bucket, oldKey, newKey) {
    await s3.send(new CopyObjectCommand({
        Bucket: bucket,
        CopySource: `${bucket}/${oldKey}`,
        Key: newKey
    }));
    await s3.send(new DeleteObjectCommand({
        Bucket: bucket,
        Key: oldKey
    }));
}
