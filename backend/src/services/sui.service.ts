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
        "collection": "Wondergame",
        "nftId": "0x235646bda6b466ee538ac0225d136d91ebbd3f323c906a91eda75140ff7077ae",
        "images": {
            "1": "https://i.imgur.com/9MYH5Al.png",
            "2": "https://i.imgur.com/9MYH5Al.png",
            "3": "https://i.imgur.com/9MYH5Al.png",
            "4": "https://i.imgur.com/9MYH5Al.png",
            "5": "https://i.imgur.com/9MYH5Al.png",
            "6": "https://i.imgur.com/9MYH5Al.png",
            "7": "https://i.imgur.com/9MYH5Al.png",
            "8": "https://i.imgur.com/9MYH5Al.png",
            "9": "https://i.imgur.com/9MYH5Al.png",
            "10": "https://i.imgur.com/9MYH5Al.png",
        }
    },
    {
        "id": "9",
        "name": "GangstaBet #1",
        "old_image": "https://i.imgur.com/Npa0Q7A.gif",
        "new_image": "https://i.imgur.com/taZqP1Z.gif",
        "collection": "GangstaBet",
        "nftId": "0xac36ddbbf7a0f238c4a9dc1b4dfa66af9303b777c708cc44a283286871330948",
        "images": {
            "1": "https://i.imgur.com/XKmw9B0.png",
            "2": "https://i.imgur.com/sxdQ5zE.png",
            "3": "https://i.imgur.com/ZxtE4CM.png",
            "4": "https://i.imgur.com/hPFOi9k.png",
            "5": "https://i.imgur.com/lAuhF6R.png",
            "6": "https://i.imgur.com/Y1RoICr.png",
            "7": "https://i.imgur.com/BYxokvy.png",
            "8": "https://i.imgur.com/v9ecWN2.png",
            "9": "https://i.imgur.com/rw4abCH.png",
            "10": "https://i.imgur.com/ocgWybB.png",
        }
    },
    {
        "id": "14",
        "name": "Mirai Hunter",
        "collection": "Studio Mirai",
        "nftId": "0xf833d01c44010c2b616ee2d9ea5a97b4790fe932920ee54cea76b17f75bbf4ba",
        "images": {
            "1": "https://i.imgur.com/QFmfrpA.png",
            "2": "https://i.imgur.com/QFmfrpA.png",
            "3": "https://i.imgur.com/QFmfrpA.png",
            "4": "https://i.imgur.com/QFmfrpA.png",
            "5": "https://i.imgur.com/QFmfrpA.png",
            "6": "https://i.imgur.com/QFmfrpA.png",
            "7": "https://i.imgur.com/QFmfrpA.png",
            "8": "https://i.imgur.com/QFmfrpA.png",
            "9": "https://i.imgur.com/QFmfrpA.png",
            "10": "https://i.imgur.com/QFmfrpA.png",
        }
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
            tx.pure.string(item.images[level.toString()]),
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

export { client, upgradeDynamicNft };