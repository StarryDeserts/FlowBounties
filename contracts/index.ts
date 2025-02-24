import { AccountAddress } from "@aptos-labs/ts-sdk";
import { Hex } from "@aptos-labs/ts-sdk";
import { config } from "../lib/aptos";
import { Aptos } from "@aptos-labs/ts-sdk";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Board, EventBoardCreated, Profile, Task, Submission } from "../type";
import {
  BoardModule,
  UserProfilePortalModule,
  MODULE_ADDRESS,
  CoinType,
} from "../constant";

const BountyTxFunction = () => {
  const aptos = new Aptos(config);
  const { account, signAndSubmitTransaction } = useWallet();

  const createUserProfile = async (
    username: string,
    email: string,
    role: string,
    bio: string
  ) => {
    const transaction = await signAndSubmitTransaction({
      sender: account!.address,
      data: {
        function: `${MODULE_ADDRESS}::${UserProfilePortalModule.MODULE_NAME}::${UserProfilePortalModule.FUNCTIONS.CREATE_USER_PROFILE}`,
        functionArguments: [username, email, role, bio],
      },
    });
    try {
      await aptos.waitForTransaction({
        transactionHash: transaction.hash,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const createBoard = async (
    board_name: string,
    description: string,
    image_url: string,
    amount: number
  ) => {
    const transaction = await signAndSubmitTransaction({
      sender: account!.address,
      data: {
        function: `${MODULE_ADDRESS}::${BoardModule.MODULE_NAME}::${BoardModule.FUNCTIONS.CREATE_BOARD}`,
        functionArguments: [board_name, description, image_url, amount],
        typeArguments: [CoinType.MOVE],
      },
    });
    try {
      await aptos.waitForTransaction({
        transactionHash: transaction.hash,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const joinBoard = async (board_id: string) => {
    const transaction = await signAndSubmitTransaction({
      sender: account!.address,
      data: {
        function: `${MODULE_ADDRESS}::${BoardModule.MODULE_NAME}::${BoardModule.FUNCTIONS.JOIN_BOARD}`,
        functionArguments: [board_id],
      },
    });
    try {
      await aptos.waitForTransaction({
        transactionHash: transaction.hash,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const createTask = async (
    board_id: string,
    task_name: string,
    description: string,
    deadline: number,
    max_completions: number,
    reward: number,
    config: string,
    allow_self_check: boolean
  ) => {
    const transaction = await signAndSubmitTransaction({
      sender: account!.address,
      data: {
        function: `${MODULE_ADDRESS}::${BoardModule.MODULE_NAME}::${BoardModule.FUNCTIONS.CREATE_TASK}`,
        functionArguments: [
          Hex.fromHexString(board_id).toString(),
          task_name,
          description,
          deadline,
          max_completions,
          reward,
          config,
          allow_self_check,
        ],
      },
    });
    try {
      await aptos.waitForTransaction({
        transactionHash: transaction.hash,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const submit_task_proof = async (
    board_id: string,
    task_id: string,
    proof: string
  ) => {
    const transaction = await signAndSubmitTransaction({
      sender: account!.address,
      data: {
        function: `${MODULE_ADDRESS}::${BoardModule.MODULE_NAME}::${BoardModule.FUNCTIONS.SUBMIT_TASK_PROOF}`,
        functionArguments: [
          board_id,
          task_id,
          proof,
        ],
      },
    });
    try {
      await aptos.waitForTransaction({
        transactionHash: transaction.hash,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const review_submission = async (
    board_id: string,
    task_id: string,
    submitter: string,
    status: number,
    review_comment: string
  ) => {
    const transaction = await signAndSubmitTransaction({
      sender: account!.address,
      data: {
        function: `${MODULE_ADDRESS}::${BoardModule.MODULE_NAME}::${BoardModule.FUNCTIONS.REVIEW_SUBMISSION}`,
        functionArguments: [
          board_id,
          task_id,
          submitter,
          status,
          review_comment,
        ],
        typeArguments: [CoinType.MOVE],
      },
    });
    try {
      await aptos.waitForTransaction({
        transactionHash: transaction.hash,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const getCreateBoardEvent = async (): Promise<EventBoardCreated[]> => {
    const created_board_event_info_payload = {
      function:
        `${MODULE_ADDRESS}::${BoardModule.MODULE_NAME}::${BoardModule.FUNCTIONS.GET_BOARD_CREATED_INFO}` as `${string}::${string}::${string}`,
    };
    const created_board_event_info = await aptos.view({
      payload: created_board_event_info_payload,
    });
    const created_board_event = (created_board_event_info[0] as any[]) || [];

    return created_board_event.map(
      (board: any): EventBoardCreated => ({
        board_id: board.board_id,
        creator: board.creator,
        name: board.name,
        description: board.description,
        img_url: board.img_url,
        reward_type: {
          account_address: board.reward_type.account_address,
          module_name: board.reward_type.module_name,
          struct_name: board.reward_type.struct_name,
        },
        total_pledged: Number(board.total_pledged),
        created_at: Math.floor(Number(board.created_at) / 1000), // 微秒 → 毫秒
        closed: board.closed,
      })
    );
  };

  const getBoardInfo = async (board_id: string): Promise<Board> => {
    const board_info_payload = {
      function:
        `${MODULE_ADDRESS}::${BoardModule.MODULE_NAME}::${BoardModule.FUNCTIONS.GET_BOARD_INFO}` as `${string}::${string}::${string}`,
      functionArguments: [board_id],
    };
    const board_info = await aptos.view({ payload: board_info_payload });

    const board = board_info[0] as unknown as Board;

    return {
      creator: board.creator,
      name: board.name,
      description: board.description,
      img_url: board.img_url,
      task_ids: board.task_ids,
      reward_type: {
        account_address: board.reward_type.account_address,
        module_name: board.reward_type.module_name,
        struct_name: board.reward_type.struct_name,
      },
      total_pledged: Number(board.total_pledged),
      members: board.members.map((m: string) => m.toLowerCase()),
      created_at: Math.floor(Number(board.created_at) / 1000), // 微秒 → 毫秒
      closed: board.closed,
    };
  };

  const getTaskInfo = async (
    board_id: string,
    task_id: string
  ): Promise<Task> => {
    const task_info_payload = {
      function:
        `${MODULE_ADDRESS}::${BoardModule.MODULE_NAME}::${BoardModule.FUNCTIONS.GET_TASK_INFO}` as `${string}::${string}::${string}`,
      functionArguments: [board_id, task_id],
    };
    const task_info = await aptos.view({ payload: task_info_payload });
    const taskData = task_info[0] as unknown as Task;

    return {
      task_id: taskData.task_id,
      name: taskData.name,
      creator: taskData.creator,
      description: taskData.description,
      deadline: Math.floor(Number(taskData.deadline) / 1000),
      max_completions: taskData.max_completions,
      reviewers: taskData.reviewers,
      completed: taskData.completed,
      rewardAmount: taskData.rewardAmount,
      created_at: Math.floor(Number(taskData.created_at) / 1000),
      cancelled: taskData.cancelled,
      config: taskData.config,
      allow_self_check: taskData.allow_self_check,
    };
  };

  const getSubmissionInfo = async (
    board_id: string,
    task_id: string,
    submitter: string
  ): Promise<Submission> => {
    const sub_info_payload = {
      function:
        `${MODULE_ADDRESS}::${BoardModule.MODULE_NAME}::${BoardModule.FUNCTIONS.GET_SUBMISSION_INFO}` as `${string}::${string}::${string}`,
      functionArguments: [board_id, task_id, submitter],
    };
    const sub_info = await aptos.view({ payload: sub_info_payload });
    console.log("sub_info", sub_info);

    const subData = sub_info[0] as unknown as Submission;

    return {
      submitter: subData.submitter,
      proof: subData.proof,
      status: subData.status,
      submitted_at: Math.floor(Number(subData.submitted_at) / 1000),
      review_comment: subData.review_comment,
    };
  };

  const getUserJoinBoardsInfo = async (user_addr: string): Promise<Board[]> => {
    const joined_board_info_payload = {
      function:
        `${MODULE_ADDRESS}::${BoardModule.MODULE_NAME}::${BoardModule.FUNCTIONS.GET_USER_JOIN_BOARDS}` as `${string}::${string}::${string}`,
      functionArguments: [user_addr],
    };
    const joined_board_info = await aptos.view({
      payload: joined_board_info_payload,
    });

    const joined_board = (joined_board_info[0] as any[]) || [];

    return joined_board.map(
      (board: any): Board => ({
        creator: board.creator,
        name: board.name,
        description: board.description,
        img_url: board.img_url,
        task_ids: board.task_ids,
        reward_type: {
          account_address: board.reward_type.account_address,
          module_name: board.reward_type.module_name,
          struct_name: board.reward_type.struct_name,
        },
        total_pledged: Number(board.total_pledged),
        members: board.members.map((m: string) => m.toLowerCase()),
        created_at: Math.floor(Number(board.created_at) / 1000), // 微秒 → 毫秒
        closed: board.closed,
      })
    );
  };

  const getUserCreateBoardsInfo = async (
    user_addr: string
  ): Promise<Board[]> => {
    const created_board_info_payload = {
      function:
        `${MODULE_ADDRESS}::${BoardModule.MODULE_NAME}::${BoardModule.FUNCTIONS.GET_USER_CREATE_BOARDS}` as `${string}::${string}::${string}`,
      functionArguments: [user_addr],
    };
    const created_board_info = await aptos.view({
      payload: created_board_info_payload,
    });

    // Get the array from the response and ensure it's typed correctly
    const created_boards = (created_board_info[0] as any[]) || [];

    // Map the boards array
    return created_boards.map(
      (board: any): Board => ({
        creator: board.creator,
        name: board.name,
        description: board.description,
        img_url: board.img_url,
        task_ids: board.task_ids,
        reward_type: {
          account_address: board.reward_type.account_address, // 注意这里改成了 reward_type
          module_name: board.reward_type.module_name,
          struct_name: board.reward_type.struct_name,
        },
        total_pledged: Number(board.total_pledged),
        members: board.members.map((m: string) => m.toLowerCase()),
        created_at: Math.floor(Number(board.created_at) / 1000),
        closed: board.closed,
      })
    );
  };

  const getUserProfileInfo = async (user_addr: string): Promise<Profile> => {
    const profile_info_payload = {
      function:
        `${MODULE_ADDRESS}::${UserProfilePortalModule.MODULE_NAME}::${UserProfilePortalModule.FUNCTIONS.GET_USER_PROFILE}` as `${string}::${string}::${string}`,
      functionArguments: [user_addr],
    };
    const profile_info = await aptos.view({
      payload: profile_info_payload,
    });

    // 获取第一个结果（假设每个地址对应唯一档案）
    const profile = profile_info[0] as unknown as Profile;

    // 转换时间戳（微秒 → 毫秒）
    const created_at = Math.floor(Number(profile!.created_at) / 1000);

    return {
      username: profile.username.trim(),
      email: profile.email.toLowerCase(),
      role: profile.role || "user",
      bio: profile.bio || "",
      user_address: profile.user_address.toLowerCase(),
      created_boards: profile.created_boards.map(
        (addr) => AccountAddress.from(addr).toString() // 标准化地址格式
      ),
      join_boards: profile.join_boards.map((addr) =>
        AccountAddress.from(addr).toString()
      ),
      created_at: isNaN(created_at) ? 0 : created_at,
    };
  };

  return {
    createUserProfile,
    createBoard,
    joinBoard,
    createTask,
    submit_task_proof,
    review_submission,
    getCreateBoardEvent,
    getBoardInfo,
    getTaskInfo,
    getSubmissionInfo,
    getUserJoinBoardsInfo,
    getUserCreateBoardsInfo,
    getUserProfileInfo,
  };
};

export default BountyTxFunction;
