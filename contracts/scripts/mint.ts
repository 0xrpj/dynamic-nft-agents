import * as dotenv from "dotenv";
import { Transaction } from "@mysten/sui/transactions";
import { bcs } from "@mysten/sui/bcs";
import getExecStuff from "./utils/execStuff";

dotenv.config();

const packageId = process.env.PACKAGE_ID;
const moduleName = "aiagent";
const functionName = "mintNFT";
const ADMIN_CAP = process.env.ADMIN_CAP;

const receiver = process.env.ADDRESS;

console.log({ packageId, ADMIN_CAP, receiver })

const mint_nft = async () => {
  const tx = new Transaction();
  const { keypair, client } = getExecStuff();

  const serReceiver = bcs.Address.serialize(receiver);

  tx.moveCall({
    target: `${packageId}::${moduleName}::${functionName}`,
    arguments: [
      tx.object(ADMIN_CAP!),
      tx.pure.string("Mirai Hunter"),
      tx.pure.string("Studio Mirai"),
      tx.pure.string("https://blog.sui.io/content/images/2024/03/Mirai-Brian_1128--1--1.png"),
      tx.pure(serReceiver),
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
  } catch (e) {
    console.error(`Failed to mint NFT `, e);
  }
};

mint_nft();
