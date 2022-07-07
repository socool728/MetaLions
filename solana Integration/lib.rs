use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, Token, TokenAccount, Transfer},
};
use solana_program::{program::invoke_signed, system_instruction};
use std::mem::size_of;

pub mod account;
pub mod constants;
pub mod error;

use account::*;
use constants::*;
use error::*;

declare_id!("8begXr4VSKSJapyavtfzYPWCXFNLe5dGrAG5dKvtfRH1");

#[program]
pub mod nftstaking {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>,
        reward_policy_by_class: [u64; CLASS_TYPES],
        lock_day_by_class: [u16; CLASS_TYPES],) -> Result<()> {
        msg!("initializing");

        let pool_account = &mut ctx.accounts.pool_account;

        pool_account.is_initialized = true;
        pool_account.admin = *ctx.accounts.admin.key;
        pool_account.paused = false; // initial status is paused
        pool_account.last_update_time = Clock::get()?.unix_timestamp;
        pool_account.staked_nft = 0;
        pool_account.lock_day_by_class = lock_day_by_class;
        pool_account.reward_policy_by_class = reward_policy_by_class;

        Ok(())
    }


    pub fn stake_nft(ctx: Context<StakeNft>, class_id: u32) -> Result<()> {
        let timestamp = Clock::get()?.unix_timestamp;

        // set stake info
        let staking_info = &mut ctx.accounts.nft_stake_info_account;
        staking_info.nft_addr = ctx.accounts.nft_mint.key();
        staking_info.owner = ctx.accounts.owner.key();
        staking_info.stake_time = timestamp;
        staking_info.last_update_time = timestamp;
        staking_info.class_id = class_id;

        // set global info
        ctx.accounts.pool_account.staked_nft += 1;

        // transfer nft to pda
        let cpi_accounts = Transfer {
            from: ctx.accounts.user_nft_token_account.to_account_info(),
            to: ctx.accounts.dest_nft_token_account.to_account_info(),
            authority: ctx.accounts.owner.to_account_info(),
        };
        let token_program = ctx.accounts.token_program.to_account_info();
        let transfer_ctx = CpiContext::new(token_program, cpi_accounts);
        token::transfer(transfer_ctx, 1)?;
        Ok(())
    }

    #[access_control(user(&ctx.accounts.nft_stake_info_account, &ctx.accounts.owner))]
    pub fn withdraw_nft(ctx: Context<WithdrawNft>) -> Result<()> {
        let timestamp = Clock::get()?.unix_timestamp;
        let staking_info = &mut ctx.accounts.nft_stake_info_account;
        let pool_account = &mut ctx.accounts.pool_account;

        let unlock_time = staking_info
            .stake_time
            .checked_add(
                (pool_account.lock_day_by_class[staking_info.class_id as usize] as i64)
                    .checked_mul(86400 as i64)
                    .unwrap(),
            )
            .unwrap();

        require!((unlock_time < timestamp), StakingError::InvalidWithdrawTime);

        let mut reward_per_day = pool_account.get_reward_per_day(staking_info.class_id as u8)?;
        if reward_per_day == 0 {
            reward_per_day = ctx.accounts.vault.to_account_info().lamports().checked_div(100).unwrap();
        }
        // When withdraw nft, calculate and send reward SOL
        let reward: u64 = staking_info.update_reward(timestamp, reward_per_day)?;

        // let vault_balance = ctx.accounts.vault.amount;
        // if vault_balance < reward {
        //     reward = vault_balance;
        // }

        ctx.accounts.pool_account.staked_nft -= 1;

        // get pool_account seed
        let (_pool_account_seed, _pool_account_bump) =
            Pubkey::find_program_address(&[POOL_SEED.as_bytes()], ctx.program_id);
        let seeds = &[POOL_SEED.as_bytes(), &[_pool_account_bump]];
        let signer = &[&seeds[..]];
        let cpi_accounts = Transfer {
            from: ctx.accounts.staked_nft_token_account.to_account_info(),
            to: ctx.accounts.user_nft_token_account.to_account_info(),
            authority: ctx.accounts.pool_account.to_account_info(),
        };
        let token_program = ctx.accounts.token_program.to_account_info().clone();
        let transfer_ctx = CpiContext::new_with_signer(token_program, cpi_accounts, signer);
        token::transfer(transfer_ctx, 1)?;

        if reward > 0 {
            msg!(
                "Calling the token program to transfer reward {} to the user",
                reward
            );

            // add vault <- sol_amount - fee
            let bump = ctx.bumps.get("vault").unwrap();
            invoke_signed(
                &system_instruction::transfer(&ctx.accounts.vault.key(), &ctx.accounts.owner.key(), reward),
                &[
                    ctx.accounts.vault.to_account_info().clone(),
                    ctx.accounts.owner.to_account_info().clone(),
                    ctx.accounts.system_program.to_account_info().clone(),
                ],
                &[&[VAULT_SEED, &[*bump]]],
            )?;
        }
        Ok(())
    }

    #[access_control(user(&ctx.accounts.nft_stake_info_account, &ctx.accounts.owner))]
    pub fn claim_reward(ctx: Context<ClaimReward>) -> Result<()> {
        let timestamp = Clock::get()?.unix_timestamp;
        let staking_info = &mut ctx.accounts.nft_stake_info_account;

        // calulate reward of this nft
        let pool_account = &mut ctx.accounts.pool_account;
        let mut reward_per_day = pool_account.get_reward_per_day(staking_info.class_id as u8)?;
        if reward_per_day == 0 {
            reward_per_day = ctx.accounts.vault.to_account_info().lamports().checked_div(100).unwrap();
        }

        // When withdraw nft, calculate and send reward SOL
        let reward: u64 = staking_info.update_reward(timestamp, reward_per_day)?;

        // let vault_balance = ctx.accounts.reward_vault.amount;

        // if vault_balance < reward {
        //     reward = vault_balance;
        // }

        msg!(
            "Calling the token program to transfer reward {} to the user",
            reward
        );
        let bump = ctx.bumps.get("vault").unwrap();
        invoke_signed(
            &system_instruction::transfer(&ctx.accounts.vault.key(), &ctx.accounts.owner.key(), reward),
            &[
                ctx.accounts.vault.to_account_info().clone(),
                ctx.accounts.owner.to_account_info().clone(),
                ctx.accounts.system_program.to_account_info().clone(),
            ],
            &[&[VAULT_SEED, &[*bump]]],
        )?;

        Ok(())
    }

    pub fn change_pool_setting(
        ctx: Context<ChangePoolSetting>,
        reward_policy_by_class: [u64; CLASS_TYPES],
        lock_day_by_class: [u16; CLASS_TYPES],
        paused: bool,
    ) -> Result<()> {
        let pool_account = &mut ctx.accounts.pool_account;
        pool_account.paused = paused; // initial status is paused
        pool_account.last_update_time = Clock::get()?.unix_timestamp;
        pool_account.lock_day_by_class = lock_day_by_class;
        pool_account.reward_policy_by_class = reward_policy_by_class;
        Ok(())
    }

    pub fn change_reward_mint(ctx: Context<ChangeRewardMint>, reward_mint: Pubkey) -> Result<()> {
        let pool_account = &mut ctx.accounts.pool_account;
        pool_account.reward_mint = reward_mint;
        Ok(())
    }

    pub fn transfer_ownership(ctx: Context<TransferOwnership>, new_admin: Pubkey) -> Result<()> {
        let pool_account = &mut ctx.accounts.pool_account;
        pool_account.admin = new_admin;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    // The pool owner
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init,
        seeds = [POOL_SEED.as_bytes()],
        bump,
        payer = admin,
        space = 8 + size_of::<PoolConfig>(),
    )]
    pub pool_account: Account<'info, PoolConfig>,

    // The rent sysvar
    pub rent: Sysvar<'info, Rent>,
    // system program
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub system_program: Program<'info, System>,

    // token program
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_program: Program<'info, Token>,
}


#[derive(Accounts)]
// #[instruction(global_bump: u8, staked_nft_bump: u8)]
pub struct StakeNft<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        seeds = [POOL_SEED.as_bytes()],
        bump,
        constraint = pool_account.is_initialized == true,
        constraint = pool_account.paused == false,
    )]
    pub pool_account: Account<'info, PoolConfig>,

    #[account(mut)]
    pub user_nft_token_account: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = owner,
        seeds = [STAKE_SEED.as_ref(), nft_mint.key.as_ref()],
        bump,
        token::mint = nft_mint,
        token::authority = pool_account,
    )]
    pub dest_nft_token_account: Account<'info, TokenAccount>,
    #[account(
        init,
        payer = owner,
        seeds = [STAKEINFO_SEED.as_ref(), nft_mint.key.as_ref()],
        bump,
        space = 8 + size_of::<StakeInfo>(),
    )]
    pub nft_stake_info_account: Account<'info, StakeInfo>,

    /// CHECK: unsafe
    pub nft_mint: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
    // pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct WithdrawNft<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        seeds = [POOL_SEED.as_bytes()],
        bump,
        constraint = pool_account.is_initialized == true,
        constraint = pool_account.paused == false,
    )]
    pub pool_account: Account<'info, PoolConfig>,

    #[account(
        mut,
        seeds = [VAULT_SEED],
        bump
    )]
    /// CHECK: this should be checked with address in global_state
    pub vault: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [STAKEINFO_SEED.as_ref(), nft_mint.key().as_ref()],
        bump,
        close = owner,
    )]
    pub nft_stake_info_account: Account<'info, StakeInfo>,

    #[account(
        mut,
        // constraint = user_nft_token_account.owner == owner.key()
    )]
    pub user_nft_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [STAKE_SEED.as_ref(), nft_mint.key().as_ref()],
        bump,
    )]
    pub staked_nft_token_account: Account<'info, TokenAccount>,

    /// CHECK: "nft_mint" is unsafe, but is not documented.
    pub nft_mint: Account<'info, Mint>,

    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct ClaimReward<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        seeds = [POOL_SEED.as_bytes()],
        bump,
        constraint = pool_account.is_initialized == true,
        constraint = pool_account.paused == false,
    )]
    pub pool_account: Account<'info, PoolConfig>,

    #[account(
        mut,
        seeds = [STAKEINFO_SEED.as_ref(), nft_mint.key().as_ref()],
        bump,
    )]
    pub nft_stake_info_account: Account<'info, StakeInfo>,

    #[account(
        mut,
        seeds = [VAULT_SEED],
        bump
    )]
    /// CHECK: this should be checked with address in global_state
    pub vault: AccountInfo<'info>,

    pub nft_mint: Account<'info, Mint>,

    // The Token Program
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct ChangePoolSetting<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [POOL_SEED.as_bytes()],
        bump,
        has_one = admin,
        constraint = pool_account.is_initialized == true,
    )]
    pub pool_account: Account<'info, PoolConfig>,
}

#[derive(Accounts)]
pub struct ChangeRewardMint<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [POOL_SEED.as_bytes()],
        bump,
        has_one = admin,
        constraint = pool_account.is_initialized == true,
    )]
    pub pool_account: Account<'info, PoolConfig>,
}

#[derive(Accounts)]
pub struct TransferOwnership<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [POOL_SEED.as_bytes()],
        bump,
        has_one = admin,
        constraint = pool_account.is_initialized == true,
    )]
    pub pool_account: Account<'info, PoolConfig>,
}
// Access control modifiers
impl<'info> Initialize<'info> {
    pub fn validate(&self) -> Result<()> {
        if self.pool_account.is_initialized == true {
            require!(
                self.pool_account.admin.eq(&self.admin.key()),
                StakingError::NotAllowedAuthority
            )
        }
        Ok(())
    }
}

pub fn user(stake_info_account: &Account<StakeInfo>, user: &AccountInfo) -> Result<()> {
    require!(
        stake_info_account.owner == *user.key,
        StakingError::InvalidUserAddress
    );
    Ok(())
}
