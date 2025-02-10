import * as dotenv from "dotenv";
import { Transaction } from "@mysten/sui/transactions";
import getExecStuff from "./utils/execStuff";

dotenv.config();

const packageId = process.env.PACKAGE_ID;
const moduleName = "aiagent";
const functionName = "updateImage";
const ADMIN_CAP = process.env.ADMIN_CAP;

const updateImage = async (nftId: string, newImageUrl: string) => {
  const tx = new Transaction();
  const { keypair, client } = getExecStuff();

  tx.moveCall({
    target: `${packageId}::${moduleName}::${functionName}`,
    arguments: [
      tx.object(
        "0x3986daaec43ef8b12ea6cbda0927a8b8225a57acfe088af3f29c8883777749fb"
      ),
      tx.object(nftId),
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
    console.error(`Failed to update NFT image:`, e);
    throw e;
  }
};

// Example usage
const nftId =
  "0x24be394839a7dd8c2ccb4bd5a54fb58e77158c42b24752bf79b405459b18bd64";
const newImageUrl =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT78y9RPFwzxVmCv_YX2IoUBeYn-gj6hJzUOw&s";
updateImage(nftId, newImageUrl);
