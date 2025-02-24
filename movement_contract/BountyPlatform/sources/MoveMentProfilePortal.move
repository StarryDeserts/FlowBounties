module platform::MoveMentProfilePortal {
    use std::error;
    use std::string::String;
    use aptos_std::table::{Self, Table};
    use aptos_framework::timestamp;
    use std::signer;
    use std::vector;

    friend platform::MoveMentBoard;

    const ERR_USER_PROFILE_NOT_FOUND: u64 = 1;
    const ERR_USER_PROFILE_ALREADY_EXISTS: u64 = 2;

    struct UserProfile has store {
        username: String,
        email: String,
        role: String,
        bio: String,
        user_address: address,
        created_boards: vector<address>,
        join_boards: vector<address>,
        created_at: u64,
    }

    struct UserProfileView has copy, drop {
        username: String,
        email: String,
        role: String,
        bio: String,
        user_address: address,
        created_boards: vector<address>,
        join_boards: vector<address>,
        created_at: u64,
    }

    struct UserProfilePortal has key, store {
        user_profiles: Table<address, UserProfile>,
        user_addresses: vector<address>,
    }

    // init UserProfilePortal
    fun init_module(sender: &signer) {
        let protal = UserProfilePortal {
            user_profiles: table::new(),
            user_addresses: vector::empty<address>()
        };
        move_to(sender, protal);
    }

    // create user profile
    public entry fun create_user_profile(
        account: &signer,
        username: String,
        email: String,
        role: String,
        bio: String,
    ) acquires UserProfilePortal {
        let user_address = signer::address_of(account);
        // get global UserProfilePortal object resource
        let portal = borrow_global_mut<UserProfilePortal>(@platform);
        // check if user profile already exists
        assert!(
            !table::contains(&portal.user_profiles, user_address),
            error::already_exists(ERR_USER_PROFILE_ALREADY_EXISTS)
        );
        // create new user profile
        let user_profile = UserProfile {
            username,
            email,
            role,
            bio,
            user_address,
            created_boards: vector::empty<address>(),
            join_boards: vector::empty<address>(),
            created_at: timestamp::now_microseconds(),
        };
        // store user profile in UserProfilePortal table
        table::add(&mut portal.user_profiles, user_address, user_profile);
        // add user address to user_addresses vector
        vector::push_back(&mut portal.user_addresses, user_address);
    }

    // when user create a board, add the board address to user's created_boards vector
    public(friend) fun update_user_profile_on_board_created(
        user_address: address,
        board_id: address
    ) acquires UserProfilePortal {
        let portal = borrow_global_mut<UserProfilePortal>(@platform);
        // check if user profile exists
        assert!(
            table::contains(&portal.user_profiles, user_address),
            error::not_found(ERR_USER_PROFILE_NOT_FOUND)
        );
        let user_profile = table::borrow_mut(&mut portal.user_profiles, user_address);
        vector::push_back(&mut user_profile.created_boards, board_id);
    }


    // when user join a board, add the board address to user's join_boards vector
    public(friend) fun update_user_profile_on_board_joined(
        user_address: address,
        board_id: address
    ) acquires UserProfilePortal {
        let portal = borrow_global_mut<UserProfilePortal>(@platform);
        // check if user profile exists
        assert!(
            table::contains(&portal.user_profiles, user_address),
            error::not_found(ERR_USER_PROFILE_NOT_FOUND)
        );
        let user_profile = table::borrow_mut(&mut portal.user_profiles, user_address);
        vector::push_back(&mut user_profile.join_boards, board_id);
    }


    // get the board created by the current user
    public(friend) fun get_created_boards(user_address: address): vector<address> acquires UserProfilePortal {
        let portal = borrow_global<UserProfilePortal>(@platform);
        assert!(table::contains(&portal.user_profiles, user_address),
            error::not_found(ERR_USER_PROFILE_NOT_FOUND));
        let created_boards =  table::borrow(&portal.user_profiles, user_address).created_boards;
        vector::slice(&created_boards, 0, vector::length(&created_boards))
    }

    // get the board joined by the current user
    public(friend) fun get_join_boards(user_address: address): vector<address> acquires UserProfilePortal {
        let portal = borrow_global<UserProfilePortal>(@platform);
        assert!(table::contains(&portal.user_profiles, user_address),
            error::not_found(ERR_USER_PROFILE_NOT_FOUND));
        let join_boards =  table::borrow(&portal.user_profiles, user_address).join_boards;
        vector::slice(&join_boards, 0, vector::length(&join_boards))
    }

    /*------View Functions------*/

    // get user profile info
    #[view]
    public fun get_user_profile(user_address: address): UserProfileView acquires UserProfilePortal {
        let portal = borrow_global<UserProfilePortal>(@platform);
        assert!(table::contains(&portal.user_profiles, user_address),
            error::not_found(ERR_USER_PROFILE_NOT_FOUND));

        let profile = table::borrow(&portal.user_profiles, user_address);
        UserProfileView {
            username: profile.username,
            email: profile.email,
            role: profile.role,
            bio: profile.bio,
            user_address: profile.user_address,
            created_boards: profile.created_boards,
            join_boards: profile.join_boards,
            created_at: profile.created_at,
        }
    }

    // get all user addresses
    #[view]
    public fun get_all_user_addresses(): vector<address> acquires UserProfilePortal {
        borrow_global<UserProfilePortal>(@platform).user_addresses
    }




}
