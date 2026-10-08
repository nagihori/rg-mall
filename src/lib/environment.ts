export type DeploymentEnvironment = 'production' | 'staging' | 'development'

// 管理画面で今どの環境を開いているかを判定する。Vercel上ではVERCEL_ENVが production / preview、
// stagingはpreviewのうちブランチ名がstagingのもの(docs/development-deployment.md)。VERCEL_ENVが無ければローカル開発。
export function detectEnvironment(env: { vercelEnv?: string; gitRef?: string }): DeploymentEnvironment {
  if (env.vercelEnv === 'production') return 'production'
  if (env.vercelEnv === 'preview') return env.gitRef === 'staging' ? 'staging' : 'development'
  return 'development'
}

export const environmentLabels: Record<DeploymentEnvironment, string> = { production: '本番', staging: 'staging', development: '開発' }
