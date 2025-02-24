export type Board = {
  creator: string;
  name: string;
  description: string;
  img_url: string;
  task_ids: string[];
  reward_type: {
    account_address: string;
    module_name: string;
    struct_name: string;
  };
  total_pledged: number;
  members: string[];
  created_at: number;
  closed: boolean;
};

export type Task = {
  task_id: string;
  name: string;
  creator: string;
  description: string;
  deadline: number;
  max_completions: number;
  reviewers: string[];
  completed: boolean;
  rewardAmount: string;
  created_at: number;
  cancelled: boolean;
  config: string;
  allow_self_check: boolean;
}

export type Profile = {
  username: string; // 用户名
  email: string; // 邮箱
  role: string; // 角色
  bio: string; // 个人简介
  user_address: string; // 用户地址
  created_boards: string[]; // 创建的赏金板列表
  join_boards: string[]; // 加入的赏金板列表
  created_at: number; // 创建时间
};

export type Submission = {
  submitter: string;
  proof: string;
  status: string;
  submitted_at: number;
  review_comment: string;
};

export type EventBoardCreated = {
  board_id: string;
  name: string;
  creator: string;
  description: string;
  img_url: string;
  reward_type: {
    account_address: string;
    module_name: string;
    struct_name: string;
  };
  total_pledged: number;
  closed: boolean;
  created_at: number;
};
