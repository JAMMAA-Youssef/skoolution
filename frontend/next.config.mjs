/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		domains: ['localhost'],
	},
	webpack(config) {
		config.module.rules.push({
			test: /\.svg$/,
			use: ["@svgr/webpack"],
		});
		return config;
	},
	rewrites() {
		return [
			{
				source: '/api/:path*',
				destination: 'http://localhost:3000/api/:path*',
			},
		];
	},
};

export default nextConfig;
