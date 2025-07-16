# IXswap Interface

[![RELEASE - AWS build & deploy](https://github.com/IX-Swap/interface/actions/workflows/release.yaml/badge.svg?branch=main)](https://github.com/IX-Swap/interface/actions/workflows/release.yaml)
[![Unit Tests](https://github.com/IX-Swap/interface/actions/workflows/unit-tests.yaml/badge.svg)](https://github.com/IX-Swap/interface/actions/workflows/unit-tests.yaml)
[![Integration Tests](https://github.com/IX-Swap/interface/actions/workflows/integration-tests.yaml/badge.svg)](https://github.com/IX-Swap/interface/actions/workflows/integration-tests.yaml)

---

- Website: [ixs.finance](https://www.ixs.finance)
- Interface: [app.ixs.finance](https://app.ixs.finance)
- Telegram: [ixswapofficial](https://t.me/ixsfinance)
- X: [@IxSwap](https://x.com/IxSwap)
- Linkedin: [IXS](https://www.linkedin.com/company/ixswap)
- Mediun: [IXS](https://ixswap.medium.com/)

# Development

Environment: Machine on Linux or MacOS
Dependencies:

1. yarn - at least v 1.22.
2. npm - at least v 7.15.1
3. node - at least v 14.17.0
   Steps:
4. Make sure your npm account is added to our [https://www.npmjs.com/settings/ixswap1/members](npm organization)
5. run npm login. You need this to be able to install ixswap packages
6. run `git clone git@github.com:IX-Swap/interface.git`
7. run `yarn build`
8. run `yarn start`

## Accessing IXswap

The IXswap App supports swapping, adding liquidity, removing liquidity.

- Swap on IXswap: https://app.ixs.finance/swap
- View IXswap liquidity: https://app.ixs.finance/pool
- Add Liquidity: https://app.ixs.finance/add

## _(FIRST DEPLOY)_ Provision your infrastructure using `terraform`

```bash
cat <<-EOF >> .env
VERSION=v1
ENVIRONMENT=production
WEBSITE_NAME='IX-Swap-Web'
AWS_REGION=ap-southeast-1
AWS_APP_NAME=ix-swap-web
AWS_APPLY_CONFIRM=true
AWS_AZS='["ap-southeast-1a", "ap-southeast-1b"]'
#AWS_ACM_ARN=''
EOF
# Configure AWS CLI
aws configure
# Initialize terraform (s3 bucket for tf.status, plugins, modules etc)
./bin/tf-init.sh
# Apply infrastructure terraform scripts
./bin/tf-apply.sh
```

###### Sync existent s3-bucket

```bash
aws s3 sync ./build/ s3://<s3-buket-name>/ --acl public-read
aws s3 website s3://<s3-buket-name/ --index-document index.html
```

**\*\***\***\*\***end\***\*\*\*\*\***
