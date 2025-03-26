# Uniswap_Flashload

```cmd
yarn hardhat run scripts/uniswap_scripts/deploy.js --network localhost

yarn hardhat run scripts/uniswap_scripts/deploy.js --network sepolia

yarn hardhat run scripts/attack_scripts/deploy00.js --network localhost
yarn hardhat run scripts/attack_scripts/deploy01.js --network localhost
yarn hardhat run scripts/attack_scripts/deploy02.js --network localhost
yarn hardhat run scripts/attack_scripts/deploy03.js --network localhost


#verify
yarn hardhat verify --network sepolia 0x4b89966D76477980dABF34eB1691721E9D6b9296 "0xe409121c12E6d748d29c132BE68552Bdc8162a81" "0xe409121c12E6d748d29c132BE68552Bdc8162a81" "1741786236"

yarn hardhat verify --network sepolia 0x4b89966D76477980dABF34eB1691721E9D6b9296 "koko" "KO"
```

### sepolia

```cmd
yarn hardhat run scripts/attack_scripts/deploy00.js --network sepolia
yarn hardhat run scripts/attack_scripts/deploy01.js --network sepolia
yarn hardhat run scripts/attack_scripts/deploy02.js --network sepolia
yarn hardhat run scripts/attack_scripts/deploy03.js --network sepolia
```
