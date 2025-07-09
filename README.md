# EntropyPass

**Smart Passwords from Real-World Entropy**

EntropyPass is a modern, secure password generator that creates high-entropy passwords using multiple sources of real-world randomness including drawing input, device timing, and environmental data.

## ✨ Features

### 🎨 Canvas Entropy
- Interactive drawing canvas that captures user input as entropy
- Mouse movements, timing, and drawing patterns contribute to password randomness
- Visual feedback showing entropy level (Weak, Moderate, Strong)

### ☁️ Weather Integration
- Incorporates live weather data as an additional entropy source
- Adds external randomness that's impossible to predict or replicate
- Fallback to secure random generation if weather API is unavailable

### 🔒 Secure Generation
- Multiple entropy sources combined using cryptographic principles
- SHA-256 hashing for secure password derivation
- Configurable password length (8-64 characters)
- Support for lowercase, uppercase, numbers, and special characters

### 🌙 Dark Mode Design
- Modern, sleek dark theme optimized for security applications
- Professional typography and spacing
- Responsive design that works on all devices

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd entropypass
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
```

The app will be built as a static export in the `out` directory, ready for deployment to any static hosting service.

## 🛠️ Technology Stack

- **Framework**: Next.js 13 with App Router
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Language**: TypeScript
- **Build**: Static export for universal deployment

## 📱 Usage

1. **Draw for Entropy**: Use the drawing canvas to create random patterns. Your mouse movements and timing add unpredictable entropy to the password generation process.

2. **Configure Password**: 
   - Adjust password length using the slider (8-64 characters)
   - Toggle character types: lowercase, uppercase, numbers, special characters
   - At least one character type must be selected

3. **Generate Password**: Click "Generate Secure Password" to create a new password using all available entropy sources.

4. **Copy & Use**: Copy the generated password to your clipboard and use it for your accounts.

5. **Test Strength**: Use the integrated Bitwarden password strength analyzer to verify your password's security.

## 🔐 Security Features

- **Multiple Entropy Sources**: Combines user input, timing data, and environmental factors
- **No Server Dependencies**: All generation happens client-side for maximum security
- **No Password Storage**: Passwords are never stored or transmitted
- **Cryptographic Hashing**: Uses industry-standard SHA-256 for entropy mixing
- **Real-time Strength Analysis**: Visual feedback on password and entropy strength

## 🎨 Design Philosophy

EntropyPass follows a security-first design approach:

- **Trust-focused**: Clean, professional appearance that inspires confidence
- **Minimalist**: Removes distractions to focus on security
- **Accessible**: High contrast, readable typography, and intuitive interactions
- **Responsive**: Works seamlessly across desktop, tablet, and mobile devices

## 🚀 Deployment

The app is configured for static export and can be deployed to:

- **Netlify**: Drag and drop the `out` folder
- **Vercel**: Connect your repository for automatic deployments
- **GitHub Pages**: Upload the `out` folder contents
- **Any static hosting**: The build output is pure HTML/CSS/JS

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Live Demo](https://entropypass.netlify.app) (if deployed)
- [Bitwarden Password Strength Tester](https://bitwarden.com/password-strength/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Next.js Documentation](https://nextjs.org/docs)

## ⚠️ Security Notice

While EntropyPass uses multiple entropy sources and follows security best practices, remember:

- Use unique passwords for every account
- Store passwords in a reputable password manager
- Enable two-factor authentication when available
- Regularly update passwords for sensitive accounts

---

**Built with ❤️ for better password security**