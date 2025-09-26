### Create PAT
Only need Actions permission

https://github.com/settings/personal-access-tokens/new

### Store your PAT

Create a hidden file:

```bash
nano ~/.github_token
```

### Add your token:

```bash
GITHUB_TOKEN="ghp_your_fine_grained_pat_here"
```

### Secure the file:

```bash
chmod 600 ~/.github_token
```
### Edit cron

```bash
crontab -e
```

### Replace 2 username placeholders

```bash
0 1 * * 1-5 . /home/<username>/.github_token; curl -X POST -H "Accept: application/vnd.github+json" -H "Authorization: Bearer $GITHUB_TOKEN" https://api.github.com/repos/asyncButNeverAwaits/test/actions/workflows/test.yml/dispatches -d '{"ref":"main"}' >> /home/<username>/github_dispatch.log 2>&1
```
