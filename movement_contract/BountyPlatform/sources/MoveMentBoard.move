module platform::MoveMentBoard {
    use std::signer;
    use std::string::{Self, String};
    use std::vector;
    use aptos_std::type_info;
    use aptos_std::type_info::TypeInfo;
    use aptos_framework::timestamp;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::table::{Self, Table};
    use aptos_framework::transaction_context::generate_auid_address;

    use platform::MoveMentProfilePortal::{
        get_join_boards,
        get_created_boards,
        update_user_profile_on_board_created,
        update_user_profile_on_board_joined
    };

    // constant submisson status
    const REJECTED: u64 = 0;
    const APPROVED: u64 = 1;
    const UNDER_REVIEW: u64 = 2;

    // constant error code
    const ERR_BOARD_IS_CLOSE: u64 = 1; // Board is closed
    const ERR_BOARD_NO_PERMISSION: u64 = 2; // No permission for the current Board
    const ERR_MEMBER_EXIST: u64 = 3; // Member already exists
    const ERR_TASK_IS_COMPLETED: u64 = 4; // The task is completed
    const ERR_TASK_IS_CANCELLED: u64 = 5; // The task is cancelled
    const ERR_DEADLINE_PASSED: u64 = 6; // The deadline has passed
    const ERR_MEMBER_NOT_EXIST: u64 = 7; // The member does not exist in the current Board
    const ERR_SUBMISSION_EXIST: u64 = 8; // The task has been submitted
    const ERR_SUBMISSION_NOT_REJECT: u64 = 9; // The status of this submission is not rejected
    const ERR_REWARD_AMOUNT_NOT_ENOUGH: u64 = 10; // The reward amount is insufficient
    const ERR_MAX_COMPLETIONS_REACHED: u64 = 11; // The maximum number of completions has been reached
    const ERR_REWARD_OVERFLOW_POOL: u64 = 12; // The reward amount exceeds the prize pool
    const ERR_REVIEWER_EXIST: u64 = 13; // The reviewer already exists in the current Task

    // BoardMetadata struct
    struct BoardMetadata has store {
        id: address,
        creator: address,
        name: String,
        description: String,
        img_url: String,
        tasks: Table<address, Task>,
        task_ids: vector<address>,
        reward_type: TypeInfo,
        total_pledged: u64,
        members: vector<address>,
        created_at: u64,
        closed: bool
    }

    // RewardPool struct
    struct RewardPool<phantom CoinType> has key {
        board_id: address,
        balance: Coin<CoinType>
    }

    // BoardRegistry struct
    struct BoardRegistry has key {
        boards: Table<address, BoardMetadata>,
        board_created_info: vector<BoardCreatedEvent>
    }

    // BoardView struct
    struct BoardView has copy, drop {
        creator: address,
        name: String,
        description: String,
        img_url: String,
        reward_type: TypeInfo,
        total_pledged: u64,
        members: vector<address>,
        task_ids: vector<address>,
        created_at: u64,
        closed: bool,
    }

    // Taks struct
    struct Task has store {
        id: address,
        name: String,
        creator: address,
        description: String,
        deadline: u64,
        maxCompletions: u64,
        numCompletions: u64,
        reviewers: vector<address>,
        submissions: Table<address, Submission>,
        completed: bool,
        rewardAmount: u64,
        created_at: u64,
        cancelled: bool,
        config: String,
        allowSelfCheck: bool,
    }

    // TaskView struct
    struct TaskView has copy, drop {
        task_id: address,
        name: String,
        creator: address,
        description: String,
        deadline: u64,
        maxCompletions: u64,
        numCompletions: u64,
        reviewers: vector<address>,
        completed: bool,
        rewardAmount: u64,
        created_at: u64,
        cancelled: bool,
        config: String,
        allowSelfCheck: bool,
    }

    // Submission struct
    struct Submission has store {
        task_id: address,
        submitter: address,
        proof: String,
        status: u64,
        submitted_at: u64,
        review_comment: String,
    }

    // SubmissionView struct
    struct SubmissionView has copy, drop {
        submitter: address,
        proof: String,
        status: u64,
        submitted_at: u64,
        review_comment: String,
    }

    // init BoardRegistry
    fun init_module(admin: &signer) {
        let registry = BoardRegistry {
            boards: table::new(),
            board_created_info: vector::empty()
        };
        move_to(admin, registry);
    }

    // create a new board
    public entry fun create_board<CoinType>(
        account: &signer,
        name: String,
        description: String,
        img_url: String,
        total_pledged: u64,
    ) acquires BoardRegistry {
        // get the address of the current caller
        let creator = signer::address_of(account);
        // get reward type
        let reward_type = type_info::type_of<CoinType>();
        // get reward balance
        let reward_balance = coin::withdraw<CoinType>(account, total_pledged);
        // init new board
        let board = BoardMetadata {
            id: generate_auid_address() ,
            creator,
            name,
            description,
            img_url,
            tasks: table::new(),
            task_ids: vector::empty(),
            reward_type,
            total_pledged,
            members: vector::empty(),
            created_at: timestamp::now_microseconds(),
            closed: false,
        };
        // creators automatically become members
        vector::push_back(&mut board.members, creator);
        // update user's personal information
        update_user_profile_on_board_created(creator, board.id);
        // emit event
        let event = BoardCreatedEvent {
            board_id: board.id,
            creator,
            name,
            description,
            img_url,
            reward_type,
            total_pledged,
            created_at: timestamp::now_microseconds(),
            closed: false,
        };
        // add board to the board registry
        let registry = borrow_global_mut<BoardRegistry>(@platform);
        vector::push_back(&mut registry.board_created_info, event);
        //init reward pool
        let reward_pool = RewardPool<CoinType> {
            board_id: board.id,
            balance: reward_balance,
        };
        table::add(&mut registry.boards, board.id, board);
        move_to(account, reward_pool);
    }

    #[event]
    struct BoardCreatedEvent has copy, store {
        board_id: address,
        creator: address,
        name: String,
        description: String,
        img_url: String,
        reward_type: TypeInfo,
        total_pledged: u64,
        created_at: u64,
        closed: bool
    }

    // Add more reward tokens to the Board
    public entry fun add_reward_to_board<CoinType>(
        account: &signer,
        board_id: address,
        reward_amount: u64,
    ) acquires BoardRegistry, RewardPool {
        // get the board
        let registry = borrow_global_mut<BoardRegistry>(@platform);
        let board = table::borrow_mut(&mut registry.boards, board_id);
        // check if the Board is closed && verify the current permissions of the caller
        assert!(!board.closed, ERR_BOARD_IS_CLOSE);
        // get the address of the current caller
        let creator = signer::address_of(account);
        assert!(creator == board.creator, ERR_BOARD_NO_PERMISSION);
        // get reward balance
        let reward_balance = coin::withdraw<CoinType>(account, reward_amount);

        // update the total pledged amount
        board.total_pledged = board.total_pledged + reward_amount;
        // update the reward pool
        let reward_pool = borrow_global_mut<RewardPool<CoinType>>(creator);
        coin::merge(&mut reward_pool.balance, reward_balance);
    }

    // Adding members to the Board
    public entry fun join_board(
        account: &signer,
        board_id: address,
    ) acquires BoardRegistry {
        // get the board
        let registry = borrow_global_mut<BoardRegistry>(@platform);
        let board = table::borrow_mut(&mut registry.boards, board_id);
        // check if the Board is closed
        assert!(!board.closed, ERR_BOARD_IS_CLOSE);
        // get the address of the current caller
        let member = signer::address_of(account);
        // check if the member already exists
        assert!(!vector::contains(&board.members, &member), ERR_MEMBER_EXIST);
        // add member to the board
        vector::push_back(&mut board.members, member);
        // update user's personal information
        update_user_profile_on_board_joined(member, board.id);
    }

    // Take out the remaining reward tokens in the Board and close it
    public entry fun withdraw_reward_and_close_board<CoinType>(
        account: &signer,
        board_id: address
    ) acquires BoardRegistry, RewardPool{
        // get the board
        let registry = borrow_global_mut<BoardRegistry>(@platform);
        let board = table::borrow_mut(&mut registry.boards, board_id);
        // check if the Board is closed
        assert!(!board.closed, ERR_BOARD_IS_CLOSE);
        // get the address of the current caller
        let creator = signer::address_of(account);
        // check if the member already exists
        assert!(creator == board.creator, ERR_BOARD_NO_PERMISSION);
        // get reward pool
        let reward_pool = borrow_global_mut<RewardPool<CoinType>>(creator);
        // take out all the rewards in the pool
        let reward = coin::extract_all(&mut reward_pool.balance);
        // deposit all the rewards into the creator's address
        coin::deposit(creator, reward);
        // close the Board
        board.closed = true;
    }

    // create a new task
    public entry fun create_task(
        account: &signer,
        board_id: address,
        name: String,
        description: String,
        deadline: u64,
        maxCompletions: u64,
        rewardAmount: u64,
        config: String,
        allowSelfCheck: bool,
    ) acquires BoardRegistry {
        // get the board
        let registry = borrow_global_mut<BoardRegistry>(@platform);
        let board = table::borrow_mut(&mut registry.boards, board_id);
        // check if the Board is closed && verify the current permissions of the caller
        assert!(!board.closed, ERR_BOARD_IS_CLOSE);
        // get the address of the current caller
        let creator = signer::address_of(account);
        assert!(creator == board.creator, ERR_BOARD_NO_PERMISSION);
        // Verify the value of maxCompletions
        let adjusted_max = if (maxCompletions <= 0) {
            1
        } else {
            maxCompletions
        };
        // Verify that the value of rewardAmount is greater than the total number of reward tokens of the Board
        assert!(board.total_pledged >= rewardAmount, ERR_REWARD_OVERFLOW_POOL);
        // init new task
        let task = Task {
            id: generate_auid_address(),
            name,
            creator,
            description,
            deadline,
            maxCompletions: adjusted_max,
            numCompletions: 0,
            reviewers: vector::empty(),
            submissions: table::new(),
            completed: false,
            rewardAmount,
            created_at: timestamp::now_microseconds(),
            cancelled: false,
            config,
            allowSelfCheck,
        };
        // Add the creator to the Task`s reviewers list
        vector::push_back(&mut task.reviewers, creator);
        // Put the Task id into the Board
        vector::push_back(&mut board.task_ids, task.id);
        // Put the created Task into the Board
        table::add(&mut board.tasks, task.id, task);
    }

    // cancel a task
    public entry fun cancel_task(
        account: &signer,
        board_id: address,
        task_id: address,
    ) acquires BoardRegistry {
        // get the board
        let registry = borrow_global_mut<BoardRegistry>(@platform);
        let board = table::borrow_mut(&mut registry.boards, board_id);
        // check if the Board is closed && verify the current permissions of the caller
        assert!(!board.closed, ERR_BOARD_IS_CLOSE);
        // get the address of the current caller
        let creator = signer::address_of(account);
        assert!(creator == board.creator, ERR_BOARD_NO_PERMISSION);
        // get the task
        let task = table::borrow_mut(&mut board.tasks, task_id);
        // Set the current task's status to canceled
        task.cancelled = true;
    }

    // Create and submit proof of task completion
    public entry fun submit_task_proof(
        account: &signer,
        board_id: address,
        task_id: address,
        proof: String,
    ) acquires BoardRegistry {
        // get the board
        let registry = borrow_global_mut<BoardRegistry>(@platform);
        let board = table::borrow_mut(&mut registry.boards, board_id);
        // check if the Board is closed
        assert!(!board.closed, ERR_BOARD_IS_CLOSE);
        // get the task
        let task = table::borrow_mut(&mut board.tasks, task_id);
        // check if the task is completed
        assert!(!task.completed, ERR_TASK_IS_COMPLETED);
        // check if the task is canceled
        assert!(!task.cancelled, ERR_TASK_IS_CANCELLED);
        // check if the deadline has passed
        assert!(task.deadline > timestamp::now_microseconds(), ERR_DEADLINE_PASSED);
        // get the address of the current caller
        let submitter = signer::address_of(account);
        // check if the submitter is a member of the Board
        assert!(vector::contains(&board.members, &submitter), ERR_MEMBER_NOT_EXIST);
        // check if the task has been submitted
        assert!(!table::contains(&task.submissions, submitter), ERR_SUBMISSION_EXIST);
        // init new submission
        let submission = Submission {
            task_id,
            submitter,
            proof,
            status: UNDER_REVIEW,
            submitted_at: timestamp::now_microseconds(),
            review_comment: string::utf8(b""),
        };
        // Put the submission into the Task
        table::add(&mut task.submissions, submitter, submission);
    }

    // Review the task completion certificate submitted (called by the Board's reviewer)
    public entry fun review_submission<CoinType>(
        account: &signer,
        board_id: address,
        task_id: address,
        submitter: address,
        status: u64,
        review_comment: String,
    ) acquires BoardRegistry, RewardPool {
        // 1. get the board && get board creator
        let registry = borrow_global_mut<BoardRegistry>(@platform);
        let board = table::borrow_mut(&mut registry.boards, board_id);
        let board_creator = board.creator;
        // 2. check if the Board is closed
        assert!(!board.closed, ERR_BOARD_IS_CLOSE);
        // 3. get the task
        let task = table::borrow_mut(&mut board.tasks, task_id);
        // 4. get the submission
        let submission = table::borrow_mut(&mut task.submissions, submitter);
        // 5. check if the task is completed
        assert!(!task.completed, ERR_TASK_IS_COMPLETED);
        // 6. check if the task is canceled
        assert!(!task.cancelled, ERR_TASK_IS_CANCELLED);
        // 7. check if the deadline has passed
        assert!(task.deadline > timestamp::now_microseconds(), ERR_DEADLINE_PASSED);
        // 8. get the address of the current caller
        let caller = signer::address_of(account);
        // 9. checks if the reviewer is in the reviewers list for the task
        assert!(vector::contains(&task.reviewers, &caller), ERR_REVIEWER_EXIST);
        // 10. update the status and reviewer comments of the submission
        // 10.1 update the status of a submission
        if (status == REJECTED) {
            submission.status = REJECTED;
        } else if (status == APPROVED) {
            submission.status = APPROVED;
            // If passed, trigger the logic of issuing rewards
            // 10.1.1. Check whether the number of completions of the current task has reached the maximum number of completions
            assert!(task.numCompletions < task.maxCompletions, ERR_MAX_COMPLETIONS_REACHED);
            // 10.1.2. Issue rewards
            // 10.1.2.1. Check if the remaining rewards on the entire board are sufficient
            assert!(board.total_pledged >= task.rewardAmount, ERR_REWARD_AMOUNT_NOT_ENOUGH);
            // 10.1.2.2. Take the reward for this task from the Board
            let reward_pool = borrow_global_mut<RewardPool<CoinType>>(board_creator);
            let reward = coin::extract(&mut reward_pool.balance, task.rewardAmount);
            // 10.1.2.3 Subtract the remaining reward amount from the Board
            board.total_pledged = board.total_pledged - task.rewardAmount;
            // 10.1.2.4 Give rewards to participants who complete the task
            coin::deposit(submitter, reward);

            // 10.1.3. Update the number of completions of the task
            task.numCompletions = task.numCompletions + 1;
            // 10.1.4. Check if the number of completions of the task has reached the maximum number of completions
            if (task.numCompletions >= task.maxCompletions) {
                task.completed = true;
            };

            //10.2 update the reviewer comments of a submission
            submission.review_comment = review_comment;
        }
    }

    // Resubmit a rejected task
    public entry fun resubmit_task_proof(
        account: &signer,
        board_id: address,
        task_id: address,
        proof: String,
    ) acquires BoardRegistry {
        // get the board
        let registry = borrow_global_mut<BoardRegistry>(@platform);
        let board = table::borrow_mut(&mut registry.boards, board_id);
        // check if the Board is closed
        assert!(!board.closed, ERR_BOARD_IS_CLOSE);
        // get the task
        let task = table::borrow_mut(&mut board.tasks, task_id);
        // check if the task is completed
        assert!(!task.completed, ERR_TASK_IS_COMPLETED);
        // check if the task is canceled
        assert!(!task.cancelled, ERR_TASK_IS_CANCELLED);
        // check if the deadline has passed
        assert!(task.deadline > timestamp::now_microseconds(), ERR_DEADLINE_PASSED);
        // get the address of the current caller
        let submitter = signer::address_of(account);
        // check if the submitter is a member of the Board
        assert!(vector::contains(&board.members, &submitter), ERR_MEMBER_NOT_EXIST);
        // get the submission
        let submission = table::borrow_mut(&mut task.submissions, submitter);
        // check if the status of this submission is rejected
        assert!(submission.status == REJECTED, ERR_SUBMISSION_NOT_REJECT);
        // update the submission
        submission.status = UNDER_REVIEW;
        submission.proof = proof;
        submission.submitted_at = timestamp::now_microseconds();
    }

    // // The creator of the board adds reviewers to the tasks in his board
    public entry fun add_reviewer(
        account: &signer,
        board_id: address,
        task_id: address,
        reviewer: vector<address>
    ) acquires BoardRegistry {
        // get the board
        let registry = borrow_global_mut<BoardRegistry>(@platform);
        let board = table::borrow_mut(&mut registry.boards, board_id);
        // check if the Board is closed
        assert!(!board.closed, ERR_BOARD_IS_CLOSE);
        // get the address of the current caller
        let creator = signer::address_of(account);
        // check if the current caller is the creator of the Board
        assert!(creator == board.creator, ERR_BOARD_NO_PERMISSION);
        // get the task
        let task = table::borrow_mut(&mut board.tasks, task_id);
        // check if the task is completed
        assert!(!task.completed, ERR_TASK_IS_COMPLETED);
        // check if the task is canceled
        assert!(!task.cancelled, ERR_TASK_IS_CANCELLED);
        // check if the deadline has passed
        assert!(task.deadline > timestamp::now_microseconds(), ERR_DEADLINE_PASSED);
        // checks whether the reviewer already exists in the reviewer list of the Task.
        let i: u64 = 0;
        let len = vector::length(&reviewer);
        while (i < len) {
            let rev = vector::borrow(&reviewer, i);
            assert!(!vector::contains(&task.reviewers, rev), ERR_REVIEWER_EXIST);
            i = i + 1;
        };
        // add reviewers to the task
        let j: u64 = 0;
        while (j < len) {
            let rev = vector::pop_back(&mut reviewer);
            vector::push_back(&mut task.reviewers, rev);
            j = j + 1;
        }
    }

    /*------View Functions------*/
    
    // get the board created information
    #[view]
    public fun get_board_created_info(): vector<BoardCreatedEvent> acquires BoardRegistry {
        let created_event_info = &borrow_global<BoardRegistry>(@platform).board_created_info;
        *created_event_info
    }

    // get the board information
    #[view]
    public fun get_board_info(
        board_id: address
    ): BoardView acquires BoardRegistry {
        let registry = borrow_global<BoardRegistry>(@platform);
        let board = table::borrow(&registry.boards, board_id);
        BoardView {
            creator: board.creator,
            name: board.name,
            description: board.description,
            img_url: board.img_url,
            task_ids: board.task_ids,
            reward_type: board.reward_type,
            total_pledged: board.total_pledged,
            members: board.members,
            created_at: board.created_at,
            closed: board.closed,
        }
    }

    // get the task information
    #[view]
    public fun get_task_info(
        board_id: address,
        task_id: address
    ): TaskView acquires BoardRegistry {
        let registry = borrow_global<BoardRegistry>(@platform);
        let board = table::borrow(&registry.boards, board_id);
        let task = table::borrow(&board.tasks, task_id);
        TaskView {
            task_id: task.id,
            name: task.name,
            creator: task.creator,
            description: task.description,
            deadline: task.deadline,
            maxCompletions: task.maxCompletions,
            numCompletions: task.numCompletions,
            reviewers: task.reviewers,
            completed: task.completed,
            rewardAmount: task.rewardAmount,
            created_at: task.created_at,
            cancelled: task.cancelled,
            config: task.config,
            allowSelfCheck: task.allowSelfCheck,
        }
    }

    // get the submission information
    #[view]
    public fun get_submission_info(
        board_id: address,
        task_id: address,
        submitter: address
    ): SubmissionView acquires BoardRegistry {
        let registry = borrow_global<BoardRegistry>(@platform);
        let board = table::borrow(&registry.boards, board_id);
        let task = table::borrow(&board.tasks, task_id);
        let submission = table::borrow(&task.submissions, submitter);
        SubmissionView {
            submitter: submission.submitter,
            proof: submission.proof,
            status: submission.status,
            submitted_at: submission.submitted_at,
            review_comment: submission.review_comment,
        }
    }

    // get the user join board information
    #[view]
    public fun get_user_join_boards(user_address: address): vector<BoardView> acquires BoardRegistry {
        let join_boards_id = get_join_boards(user_address);
        let len = vector::length(&join_boards_id);
        let i = 0;
        let join_boards = vector::empty<BoardView>();
        while (i < len) {
            let board_id = vector::pop_back(&mut join_boards_id);
            let board = table::borrow(&borrow_global<BoardRegistry>(@platform).boards, board_id);
            let board_view = BoardView {
                creator: board.creator,
                name: board.name,
                description: board.description,
                img_url: board.img_url,
                task_ids: board.task_ids,
                reward_type: board.reward_type,
                total_pledged: board.total_pledged,
                members: board.members,
                created_at: board.created_at,
                closed: board.closed,
            };
            vector::push_back(&mut join_boards, board_view);
            i = i + 1;
        };
        join_boards
    }

    // get the user create board information
    #[view]
    public fun get_user_create_boards(user_address: address): vector<BoardView> acquires BoardRegistry {
        let create_boards_id = get_created_boards(user_address);
        let len = vector::length(&create_boards_id);
        let i = 0;
        let create_boards = vector::empty<BoardView>();
        while (i < len) {
            let board_id = vector::pop_back(&mut create_boards_id);
            let board = table::borrow(&borrow_global<BoardRegistry>(@platform).boards, board_id);
            let board_view = BoardView {
                creator: board.creator,
                name: board.name,
                description: board.description,
                img_url: board.img_url,
                task_ids: board.task_ids,
                reward_type: board.reward_type,
                total_pledged: board.total_pledged,
                members: board.members,
                created_at: board.created_at,
                closed: board.closed,
            };
            vector::push_back(&mut create_boards, board_view);
            i = i + 1;
        };
        create_boards
    }

}