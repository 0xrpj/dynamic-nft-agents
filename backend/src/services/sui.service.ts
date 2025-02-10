import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
const client = new SuiClient({ url: getFullnodeUrl('testnet') });

const packageId = "0x092139eeaf32b068f71eca837e24a600e01fecd823f0fc997e19f0979d526bf7";
const adminCap = "0xc041cc6f0138072dbfacadd8980e663e3b579c61927afe60d41cd8b199681719"
const moduleName = "aiagent";

const imageMapping = [
    {
        "id": "0",
        "name": "Queen 102",
        "old_image": "https://i.imgur.com/9MYH5Al.png",
        "new_image": "https://i.imgur.com/HzFgb2o.png",
        "collection": "Wondergame",
        "level": 1,
        "points": 1,
        "nftId":"0x235646bda6b466ee538ac0225d136d91ebbd3f323c906a91eda75140ff7077ae"
    },
    {
        "id": "9",
        "name": "GangstaBet #1",
        "old_image": "https://i.imgur.com/Npa0Q7A.gif",
        "new_image": "https://i.imgur.com/taZqP1Z.gif",
        "collection": "GangstaBet",
        "level": 1,
        "points": 1,
        "nftId":"0xac36ddbbf7a0f238c4a9dc1b4dfa66af9303b777c708cc44a283286871330948"
    },
    {
        "id": "14",
        "name": "Mirai Hunter",
        "old_image": "https://i.imgur.com/QFmfrpA.png",
        "new_image": "https://i.imgur.com/J7rLkLB.png",
        "collection": "Studio Mirai",
        "level": 1,
        "points": 1,
        "nftId":"0xf833d01c44010c2b616ee2d9ea5a97b4790fe932920ee54cea76b17f75bbf4ba"
    }
]

const upgradeDynamicNft = async (nftId: string, level: number) => {
    const tx = new Transaction();
    const keypair = Ed25519Keypair.deriveKeypair(process.env.MNEMONICS);
    const item = imageMapping.find(item => item.id === nftId)

    tx.moveCall({
        target: `${packageId}::${moduleName}::upgradeLevel`,
        arguments: [
          tx.object(adminCap),
          tx.object(item.nftId),
          tx.pure.u8(level),
          tx.pure.string(item.new_image),
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

const upgradeDynamicNftOld = async (nftId: string, level: number) => {
    const tx = new Transaction();
    const keypair = Ed25519Keypair.deriveKeypair(process.env.MNEMONICS);
    const item = imageMapping.find(item => item.id === nftId)

    tx.moveCall({
        target: `${packageId}::${moduleName}::upgradeLevel`,
        arguments: [
          tx.object(adminCap),
          tx.object(item.nftId),
          tx.pure.u8(level),
          tx.pure.string(item.old_image),
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

export { client, upgradeDynamicNft, upgradeDynamicNftOld };