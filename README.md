## BlockAuth — Blockchain-based IoT Access Control

BlockAuth is a local-first demo project that uses an Ethereum smart contract + a Node.js API + a React dashboard to register IoT identities, grant access permissions, and view access logs.

### Start-to-end setup (new machine)

- **Prereqs**
  - Node.js 16+ (Node 18+ recommended)
  - A local chain: Ganache (RPC usually `http://127.0.0.1:7545`) or Hardhat node (RPC `http://127.0.0.1:8545`)
  - MetaMask (optional but recommended for the UI)

- **1) Install root dependencies (Hardhat + scripts)**

```bash
npm install
```

- **2) Create env files**
  - Copy `/.env.example` → `/.env` and fill in values.
  - (Optional) Copy `/Frontend/.env.example` → `/Frontend/.env`.

- **3) Start your local chain**
  - **Ganache**: start Ganache Desktop and confirm RPC matches `ALCHEMY_API_URL` in `.env`.
  - **Hardhat node** (alternative):

```bash
npx hardhat node
```

If you use Hardhat node, set `ALCHEMY_API_URL=http://127.0.0.1:8545` in `.env`.

- **4) Deploy the contract**

Ganache network:

```bash
npx hardhat run Scripts/deploy.js --network ganache
```

Hardhat node:

```bash
npx hardhat run Scripts/deploy.js --network localhost
```

After deploy, copy the printed address into `CONTRACT_ADDRESS` in `.env`.

- **5) Start the backend**

```bash
cd Backend
npm install
node server.js
```

Backend should come up on `http://localhost:5000`.

- **6) Start the frontend**

```bash
cd Frontend
npm install
npm start
```

Frontend should come up on `http://localhost:3000`.

- **7) (Optional) Run the simulation**
  - Keep backend running.
  - From repo root:

```bash
node Scripts/run-simulation.js
```

### Environment variables

- **Backend / scripts (`.env`)**
  - `ALCHEMY_API_URL`: RPC URL (Ganache `7545` or Hardhat node `8545`)
  - `DEPLOYER_PRIVATE_KEY`: used by Hardhat deploy (recommended)
  - `SERVER_PRIVATE_KEY`: backend “admin” wallet used to call admin-only contract methods
  - `ADMIN_PRIVATE_KEY`: used by `Scripts/run-simulation.js` to fund device accounts
  - `CONTRACT_ADDRESS`: deployed contract address
  - `PORT`: backend port (default `5000`)

- **Frontend (`Frontend/.env`, optional)**
  - `REACT_APP_API_BASE_URL`: defaults to `http://localhost:5000/api`
  - `REACT_APP_ADMIN_ADDRESS`: the admin/deployer address (used for UI admin detection)

### Full walkthrough

See `tutorial.md` for screenshots/expected outputs and troubleshooting steps.
