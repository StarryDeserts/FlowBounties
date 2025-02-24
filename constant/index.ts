export const MODULE_ADDRESS = "0x2e5f33f9b87b179dc3e162524731f4546c228ff65eb79121913ef583adfeac2d"

export const BoardModule = {
  MODULE_NAME: "MoveMentBoard",
  FUNCTIONS: {
    CREATE_BOARD: "create_board",
    ADD_REWARD_TO_BOARD: "add_reward_to_board",
    JOIN_BOARD: "join_board",
    WITHDRAW_REWARD_AND_CLOSE_BOARD: "withdraw_reward_and_close_board",
    CREATE_TASK: "create_task",
    CANCEL_TASK: "cancel_task",
    SUBMIT_TASK_PROOF: "submit_task_proof",
    REVIEW_SUBMISSION: "review_submission",
    RESUBMIT_TASK_PROOF: "resubmit_task_proof",
    ADD_REVIEWER: "add_reviewer",

    // View functions
    GET_BOARD_CREATED_INFO: "get_board_created_info",
    GET_BOARD_INFO: "get_board_info",
    GET_TASK_INFO: "get_task_info",
    GET_SUBMISSION_INFO: "get_submission_info",
    GET_USER_JOIN_BOARDS: "get_user_join_boards",
    GET_USER_CREATE_BOARDS: "get_user_create_boards",

  },
  EVENTS: {
    BOARD_CREATED: "BoardCreatedEvent",
  },
  STRUCT: {
    BOARD_METADATA: "BoardMetadata",
    TASK: "Task",
    SUBMISSION: "Submission",
  }
} as const;

export const UserProfilePortalModule = {
  MODULE_NAME: "MoveMentProfilePortal",
  FUNCTIONS: {
    CREATE_USER_PROFILE: "create_user_profile",
    
    // View functions
    GET_USER_PROFILE: "get_user_profile",
    GET_ALL_USER_ADDRESSES: "get_all_user_addresses",
  },
  STRUCT: {
    USER_PROFILE: "UserProfile",
  }
} as const;

export const SubmissionStatus = {
  REJECTED: 0,
  APPROVED: 1,
  UNDER_REVIEW: 2,
} as const;

export const TaskStatus = {
  ACTIVE: 0,
  COMPLETED: 1,
  CANCELLED: 2,
} as const;

export const CoinType = {
  MOVE: "0x1::aptos_coin::AptosCoin",
  // 可根据需要添加其他币种
} as const;

export const SystemAddresses = {
  CLOCK: "0x6",
  MISSION: "@mission", // 根据实际合约地址替换
} as const;