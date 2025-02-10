import * as dotenv from "dotenv";
import { Transaction } from "@mysten/sui/transactions";
import getExecStuff from "./utils/execStuff";

dotenv.config();

const packageId = process.env.PACKAGE_ID;
const moduleName = "aiagent";
const functionName = "upgradeLevel";
const ADMIN_CAP = process.env.ADMIN_CAP;

const upgradeLevel = async (nftId: string, newLevel: number, newImageUrl: string) => {
  const tx = new Transaction();
  const { keypair, client } = getExecStuff();

  tx.moveCall({
    target: `${packageId}::${moduleName}::${functionName}`,
    arguments: [
      tx.object(ADMIN_CAP!),
      tx.object(nftId),
      tx.pure.u8(newLevel),
      tx.pure.string(newImageUrl),
    ],
  });

  try {
    const result = await client.signAndExecuteTransaction({
      signer: keypair,
      transaction: tx,
    });

    const transaction = await client.waitForTransaction({
      digest: result.digest,
      options: {
        showEffects: true,
      },
    });

    console.log(`Transaction Digest: ${transaction.digest}`);
    return transaction;
  } catch (e) {
    console.error(`Failed to upgrade NFT level:`, e);
    throw e;
  }
};

// Example usage
const nftId = "0x24be394839a7dd8c2ccb4bd5a54fb58e77158c42b24752bf79b405459b18bd64";
const newLevel = 2;
const newImageUrl = "https://example.com/new-image.webp";
upgradeLevel(nftId, newLevel, newImageUrl);