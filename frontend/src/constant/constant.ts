export const packageId = "0x092139eeaf32b068f71eca837e24a600e01fecd823f0fc997e19f0979d526bf7";
export const demoAddress = "0x3d2e7fbc0bccd8ab4b5e3375cc28cf22a343ed4e96e96f45450c4e019a9fe445"; // Fetching NFTs of this user for testing purposes. Will be replace by userDetails.address in production

export const getId = (nftId: string) => {
    if (nftId === "0xac36ddbbf7a0f238c4a9dc1b4dfa66af9303b777c708cc44a283286871330948") {
      return '1';
    } else if (nftId === "0xf833d01c44010c2b616ee2d9ea5a97b4790fe932920ee54cea76b17f75bbf4ba") {
      return '2';
    } else {
      return '3';
    }
  }