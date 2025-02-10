# 🔥 About the project
Dynamic NFT Agent is a project to push the boundaries of NFTs beyond static collectibles or mere transaction assets by transforming them into intelligent, interactive agents. Leveraging the dynamic NFT capabilities of the Sui blockchain, this initiative introduces NFTs as AI-powered entities that actively assist players in games.

# ❤️ Key Features
1. Companionship from Dynamic NFT Agents
2. zK Login Based Integration
3. Unique AI personalities driven by each NFT’s storyline
4. Smart Contract Based Upgradable NFTs as level progresses

# ❕ Prerequisites
- [Python 2.7+](https://www.python.org/)
- [Node.js 23+](https://nodejs.org/)
- [pnpm](https://pnpm.io/)

# 📺 Demo Video
https://youtu.be/PZS1ME9OsbU

# 📁 Folder Structure and Instructions to Run
## Frontend
- **Framework Used**: ReactJS
- **Steps to Run**:
  1. Navigate to the frontend directory:
     ```sh
     cd frontend
     ```
  2. Install dependencies:
     ```sh
     npm install
     ```
  3. Fill in environment variable values.
  4. Start the development server:
     ```sh
     npm run dev
     ```

## Backend
- **Framework Used**: Express, Node.js
- **Steps to Run**:
  1. Navigate to the backend directory:
     ```sh
     cd backend
     ```
  2. Install dependencies:
     ```sh
     pnpm install
     ```
  3. Fill in environment variable values.
  4. Start the backend server:
     ```sh
     npm run dev
     ```

## Contracts
- **Framework Used**: Sui Move
- **Content**: Dynamic NFT contract
- **Steps to Deploy**:
  1. Navigate to the contracts directory:
     ```sh
     cd contracts
     ```
  2. Install dependencies:
     ```sh
     npm install
     ```
  3. Fill in environment variable values.
  4. Run the deployment script:
     ```sh
     npx ts-node scripts/setup.ts
     ```
  5. Retrieve the package ID and update it in the frontend and backend environment files.