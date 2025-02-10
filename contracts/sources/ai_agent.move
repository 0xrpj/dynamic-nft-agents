module ai_agent::aiagent {

    use sui::url::{Self};
    use sui::display;
    use sui::package;
    use std::string;
    use sui::event;
 
    public struct NFT has key, store {
        id:UID,
        name:string::String,
        description:string::String,
        image_url:url::Url,
        ai_level:u8,
        win_rate:u8
    }
    
    public struct AdminCap has key, store {
        id:UID
    }

    public struct NFTMinted has copy, drop {
        nft_id:ID,
        creator:address,
    }

    public struct NFTLevelUpgraded has copy, drop {
        nft_id:ID,
        level:u8
    }
    public struct NFTImageUpgraded has copy, drop {
        nft_id:ID,
        image_url:url::Url
    }

    public struct AIAGENT has drop {}

      fun init(otw: AIAGENT, ctx: &mut TxContext) {
        let admin_cap = AdminCap{
            id:object::new(ctx)
        };

        let keys = vector[
            b"name".to_string(),
            b"link".to_string(),
            b"image_url".to_string(),
            b"description".to_string(),
          
            b"project_url".to_string(),
            b"creator".to_string(),

        ];

        let values = vector[
            b"{name}".to_string(),
            b"https://explorer.sui.io/object/{id}".to_string(),
            b"{image_url}".to_string(),
            b"{description}".to_string(),
         
            b"https://aiagent.xyz".to_string(),
            b"AIAgent".to_string()
        ];

        let publisher = package::claim(otw, ctx);
        let mut display = display::new_with_fields<NFT>(&publisher, keys, values, ctx);
        display.update_version();

        transfer::transfer(admin_cap, ctx.sender());
        transfer::public_transfer(publisher, ctx.sender());
        transfer::public_transfer(display, ctx.sender());
    }


    public fun mintNFT(_:&AdminCap, name:vector<u8>, description:vector<u8>, image_url:vector<u8>,receiver:address, ctx:&mut TxContext) {
        
        let nft = NFT {
            id: object::new(ctx),
            name:string::utf8(name),
            description:string::utf8(description),
            image_url:url::new_unsafe_from_bytes(image_url),
            ai_level:1,//default
            win_rate:1
        };

         let nft_id = object::id(&nft);

        transfer::public_transfer(nft,receiver );
        event::emit(NFTMinted{
            nft_id:nft_id,
            creator:receiver
        })        
    }

    public fun upgradeLevel(_:&AdminCap,nft:&mut NFT, level:u8,new_url:vector<u8>) {
        nft.image_url = url::new_unsafe_from_bytes(new_url);
        nft.ai_level = level;

       event::emit(NFTLevelUpgraded{
        nft_id:object::id(nft),
        level:level
        })
    }

    public fun updateImage(_:&AdminCap,nft:&mut NFT,new_url:vector<u8>) {
        nft.image_url = url::new_unsafe_from_bytes(new_url);
        event::emit(NFTImageUpgraded{
        nft_id:object::id(nft),
        image_url:url::new_unsafe_from_bytes(new_url),
        })
    }

    public fun add_admin(_: &AdminCap, new_admin: address, ctx: &mut TxContext) {
    
    let new_admin_cap = AdminCap {
        id: object::new(ctx)
    };

    transfer::public_transfer(new_admin_cap, new_admin);
}
}