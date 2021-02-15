interface SimpleUser {
  login: string
  id: number
  node_id: string
  avatar_url: string
  gravatar_id: string | null
  url: string
  html_url: string
  followers_url: string
  following_url: string
  gists_url: string
  starred_url: string
  subscriptions_url: string
  organizations_url: string
  repos_url: string
  events_url: string
  received_events_url: string
  type: string
  site_admin: boolean
  starred_at?: string
}

interface Integration {
  /** Unique identifier of the GitHub app */
  id: number
  /** The slug name of the GitHub app */
  slug?: string
  node_id: string
  owner: SimpleUser | null
  /** The name of the GitHub app */
  name: string
  description: string | null
  external_url: string
  html_url: string
  created_at: string
  updated_at: string
  /** The set of permissions for the GitHub app */
  permissions: {
    issues?: string
    checks?: string
    metadata?: string
    contents?: string
    deployments?: string
  } & {[key: string]: string}
  /** The list of events for the GitHub app */
  events: string[]
  /** The number of installations associated with the GitHub app */
  installations_count?: number
  client_id?: string
  client_secret?: string
  webhook_secret?: string
  pem?: string
}

export interface DeploymentStatus {
  url: string
  id: number
  node_id: string
  /** The state of the status. */
  state:
    | 'error'
    | 'failure'
    | 'inactive'
    | 'pending'
    | 'success'
    | 'queued'
    | 'in_progress'
  creator: SimpleUser | null
  /** A short description of the status. */
  description: string
  /** The environment of the deployment that the status is for. */
  environment?: string
  /** Deprecated: the URL to associate with this status. */
  target_url: string
  created_at: string
  updated_at: string
  deployment_url: string
  repository_url: string
  /** The URL for accessing your environment. */
  environment_url?: string
  /** The URL to associate with this status. */
  log_url?: string
  performed_via_github_app?: Integration | null
}
