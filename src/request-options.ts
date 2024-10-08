export interface GithubRequestParameters {
  /**
   * The account owner of the repository.
   */
  owner: string;
  /**
   * The name of the repository without the .git extension
   */
  repo: string;
}
