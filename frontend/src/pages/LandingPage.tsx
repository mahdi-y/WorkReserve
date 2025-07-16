import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import topography from '../assets/images/topography.svg';

const features = [
	{
		title: 'Smart Workspace Booking',
		description:
			'Reserve desks, meeting rooms, or resources with intelligent scheduling. See real-time availability, manage conflicts, and get smart suggestions for optimal booking times.',
		icon: (
			<svg
				className="w-10 h-10 text-blue-600 dark:text-blue-400"
				fill="none"
				stroke="currentColor"
				strokeWidth={2}
				viewBox="0 0 24 24"
			>
				<rect x="3" y="8" width="18" height="13" rx="2" />
				<path d="M16 3v5M8 3v5M3 13h18" />
			</svg>
		),
	},
	{
		title: 'Advanced User Management',
		description:
			'Secure user registration, email verification, password recovery, profile management, and role-based permissions with multi-factor authentication support.',
		icon: (
			<svg
				className="w-10 h-10 text-emerald-600 dark:text-emerald-400"
				fill="none"
				stroke="currentColor"
				strokeWidth={2}
				viewBox="0 0 24 24"
			>
				<circle cx="12" cy="7" r="4" />
				<path d="M5.5 21a8.38 8.38 0 0 1 13 0" />
			</svg>
		),
	},
	{
		title: 'Comprehensive Admin Dashboard',
		description:
			'Powerful admin controls for managing users, rooms, reservations, and analytics. Monitor usage patterns, generate reports, and optimize workspace allocation.',
		icon: (
			<svg
				className="w-10 h-10 text-indigo-600 dark:text-indigo-400"
				fill="none"
				stroke="currentColor"
				strokeWidth={2}
				viewBox="0 0 24 24"
			>
				<rect x="3" y="3" width="7" height="7" rx="1.5" />
				<rect x="14" y="3" width="7" height="7" rx="1.5" />
				<rect x="14" y="14" width="7" height="7" rx="1.5" />
				<rect x="3" y="14" width="7" height="7" rx="1.5" />
			</svg>
		),
	},
	{
		title: 'Enterprise Security',
		description:
			'Built with enterprise-grade security: JWT authentication, rate limiting, email verification, HTTPS encryption, and comprehensive audit logging.',
		icon: (
			<svg
				className="w-10 h-10 text-red-600 dark:text-red-400"
				fill="none"
				stroke="currentColor"
				strokeWidth={2}
				viewBox="0 0 24 24"
			>
				<path d="M12 17v.01" />
				<rect x="5" y="11" width="14" height="10" rx="2" />
				<path d="M7 11V7a5 5 0 0 1 10 0v4" />
			</svg>
		),
	},
];

const extraInfos = [
	{
		title: 'AI-Powered Analytics',
		description:
			'Get intelligent insights into workspace usage patterns, peak hours, and optimization recommendations powered by machine learning.',
		icon: (
			<svg
				className="w-10 h-10 text-purple-600 dark:text-purple-400"
				fill="none"
				stroke="currentColor"
				strokeWidth={2}
				viewBox="0 0 24 24"
			>
				<path d="M9 19c-5 0-8-3-8-8s3-8 8-8 8 3 8 8-3 8-8 8z" />
				<path d="M17 17l4.5 4.5" />
			</svg>
		),
	},
	{
		title: 'Advanced Integrations',
		description:
			'Seamlessly connect with Slack, Microsoft Teams, Google Workspace, Outlook Calendar, Zapier, and custom APIs for automated workflows.',
		icon: (
			<svg
				className="w-10 h-10 text-cyan-600 dark:text-cyan-400"
				fill="none"
				stroke="currentColor"
				strokeWidth={2}
				viewBox="0 0 24 24"
			>
				<circle cx="12" cy="12" r="10" />
				<path d="M8 12h8M12 8v8" />
			</svg>
		),
	},
	{
		title: 'Real-time Notifications',
		description:
			'Stay updated with instant notifications via email, SMS, push notifications, and in-app alerts for bookings, changes, and reminders.',
		icon: (
			<svg
				className="w-10 h-10 text-orange-600 dark:text-orange-400"
				fill="none"
				stroke="currentColor"
				strokeWidth={2}
				viewBox="0 0 24 24"
			>
				<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
				<path d="M13.73 21a2 2 0 0 1-3.46 0" />
			</svg>
		),
	},
	{
		title: 'Multi-Platform Access',
		description:
			'Native mobile apps for iOS and Android, responsive web interface, desktop applications, and API access for custom integrations.',
		icon: (
			<svg
				className="w-10 h-10 text-teal-600 dark:text-teal-400"
				fill="none"
				stroke="currentColor"
				strokeWidth={2}
				viewBox="0 0 24 24"
			>
				<rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
				<line x1="8" y1="21" x2="16" y2="21" />
				<line x1="12" y1="17" x2="12" y2="21" />
			</svg>
		),
	},
];

const techStack = [
	{
		name: 'React + TypeScript',
		description: 'Modern frontend with type safety',
		color: 'text-blue-600 dark:text-blue-400',
	},
	{
		name: 'Spring Boot + Java',
		description: 'Robust backend architecture',
		color: 'text-green-600 dark:text-green-400',
	},
	{
		name: 'PostgreSQL',
		description: 'Reliable database management',
		color: 'text-indigo-600 dark:text-indigo-400',
	},
	{
		name: 'Docker + Kubernetes',
		description: 'Scalable deployment',
		color: 'text-purple-600 dark:text-purple-400',
	},
];

const stats = [
	{ number: '10,000+', label: 'Active Users', icon: '👥' },
	{ number: '50,000+', label: 'Bookings Made', icon: '📅' },
	{ number: '99.9%', label: 'Uptime', icon: '⚡' },
	{ number: '24/7', label: 'Support', icon: '🛠️' },
];

const testimonials = [
	{
		name: 'Sarah Johnson',
		role: 'Office Manager at TechCorp',
		quote:
			'WorkReserve has completely transformed our office management. The AI suggestions help us optimize our space usage, and the mobile app makes booking on-the-go effortless.',
		avatar: '👩‍💼',
		rating: 5,
	},
	{
		name: 'Michael Chen',
		role: 'CTO at StartupHub',
		quote:
			'The analytics dashboard provides incredible insights into our workspace utilization. The security features and API integrations make it perfect for our enterprise needs.',
		avatar: '👨‍💻',
		rating: 5,
	},
	{
		name: 'Emily Rodriguez',
		role: 'HR Director at GlobalTech',
		quote:
			'Onboarding new employees is seamless with WorkReserve. The calendar integration and notification system keep everyone informed and organized.',
		avatar: '👩‍🎓',
		rating: 5,
	},
];

const LandingPage: React.FC = () => {
	const [darkMode, setDarkMode] = useState(false);

	useEffect(() => {
		const initializeTheme = () => {
			const savedTheme = localStorage.getItem('workreserve-theme');
			if (savedTheme === 'dark' || savedTheme === 'light') {
				const isDark = savedTheme === 'dark';
				setDarkMode(isDark);
				applyTheme(isDark);
			} else {
				const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
				setDarkMode(systemPrefersDark);
				applyTheme(systemPrefersDark);
				localStorage.setItem('workreserve-theme', systemPrefersDark ? 'dark' : 'light');
			}
		};

		initializeTheme();
	}, []);

	const applyTheme = (isDark: boolean) => {
		if (isDark) {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	};

	const toggleTheme = () => {
		const newDarkMode = !darkMode;
		setDarkMode(newDarkMode);
		applyTheme(newDarkMode);
		localStorage.setItem('workreserve-theme', newDarkMode ? 'dark' : 'light');
	};

	return (
		<div
			className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 dark:from-gray-950 dark:via-slate-900 dark:to-indigo-950 flex flex-col transition-all duration-500 relative overflow-x-hidden"
			style={{
				backgroundImage: `url(${topography})`,
				backgroundRepeat: 'repeat',
				backgroundSize: '400px 400px',
				backgroundBlendMode: darkMode ? 'overlay' : 'normal',
				opacity: darkMode ? 0.95 : 1,
			}}
		>
			<div
				className="absolute inset-0 z-0 dark:opacity-20 opacity-0 transition-opacity duration-500"
				style={{
					backgroundImage: `url(${topography})`,
					backgroundRepeat: 'repeat',
					backgroundSize: '300px 300px',
					filter: 'invert(1) contrast(1.2)',
				}}
			/>

			<div className="pointer-events-none select-none">
				<div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-300/20 dark:bg-blue-400/10 rounded-full blur-3xl z-0 animate-pulse" />
				<div
					className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-indigo-200/20 dark:bg-indigo-400/10 rounded-full blur-3xl z-0 animate-pulse"
					style={{ transform: 'translate(-50%, -50%)' }}
				/>
				<div className="absolute bottom-0 right-0 w-[550px] h-[550px] bg-purple-200/20 dark:bg-purple-400/10 rounded-full blur-3xl z-0 animate-pulse" />
				<div className="absolute top-20 right-20 w-[300px] h-[300px] bg-cyan-200/15 dark:bg-cyan-400/8 rounded-full blur-2xl z-0 animate-pulse" />
			</div>

			<header className="w-full py-6 px-4 flex justify-between items-center bg-white/60 dark:bg-gray-950/60 shadow-lg backdrop-blur-xl z-10 relative border-b border-white/20 dark:border-gray-800/30">
				<div className="flex items-center space-x-3">
					<img
						src="/src/assets/images/workreserve-icon-logo1.png"
						alt="WorkReserve Logo"
						className="w-12 h-12 object-contain"
					/>
					<span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent tracking-tight">
						WorkReserve
					</span>
				</div>
				<div className="flex items-center space-x-2">
					<Button asChild variant="ghost" className="hover:bg-white/20 dark:hover:bg-gray-800/20">
						<Link to="/login">Sign In</Link>
					</Button>
					<Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg">
						<Link to="/register">Get Started Free</Link>
					</Button>
					<Button
						variant="ghost"
						aria-label="Toggle dark mode"
						onClick={toggleTheme}
						className="ml-2 rounded-full bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border border-white/10 dark:border-gray-700/10 hover:bg-white/30 dark:hover:bg-gray-800/30"
					>
						{darkMode ? (
							<svg
								className="w-6 h-6 text-yellow-400"
								fill="none"
								stroke="currentColor"
								strokeWidth={2}
								viewBox="0 0 24 24"
							>
								<path d="M12 3v1m0 16v1m8.66-8.66l-.71.71M4.05 19.07l-.71.71M21 12h-1M4 12H3m16.24 4.24l-.71-.71M6.34 6.34l-.71-.71" />
								<circle cx="12" cy="12" r="5" />
							</svg>
						) : (
							<svg
								className="w-6 h-6 text-gray-700 dark:text-gray-200"
								fill="none"
								stroke="currentColor"
								strokeWidth={2}
								viewBox="0 0 24 24"
							>
								<path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
							</svg>
						)}
					</Button>
				</div>
			</header>

			<section className="flex-1 flex flex-col justify-center items-center text-center px-4 py-20 relative z-10">
				<div className="max-w-4xl mx-auto">
					<h1 className="text-6xl md:text-7xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
						The Future of{' '}
						<span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
							Workspace
						</span>{' '}
						Management
					</h1>
					<p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
						Transform your workplace with AI-powered booking, real-time analytics, and seamless integrations.
						<span className="block mt-2 font-semibold text-gray-800 dark:text-gray-200">
							Trusted by 10,000+ organizations worldwide.
						</span>
					</p>
					<div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
						<Button asChild size="lg" className="text-xl px-10 py-6 shadow-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all">
							<Link to="/register">Start Free Trial</Link>
						</Button>
						<Button asChild size="lg" variant="outline" className="text-xl px-10 py-6 border-2 border-gray-300 dark:border-gray-600 hover:bg-white/20 dark:hover:bg-gray-800/20 backdrop-blur-sm">
							<Link to="/login">Watch Demo</Link>
						</Button>
					</div>

					<div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
						{stats.map((stat, idx) => (
							<div key={idx} className="text-center bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm rounded-xl p-4 border border-white/10 dark:border-gray-700/10">
								<div className="text-3xl mb-2">{stat.icon}</div>
								<div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{stat.number}</div>
								<div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
							</div>
						))}
					</div>

					<div className="flex justify-center gap-6 mt-8">
						<img src="/src/assets/images/landing-hero1.png" alt="Workspace Dashboard" className="w-80 h-52 object-cover rounded-2xl shadow-2xl hidden lg:block border border-white/20 dark:border-gray-700/20" />
						<img src="/src/assets/images/landing-hero2.png" alt="Mobile App" className="w-80 h-52 object-cover rounded-2xl shadow-2xl hidden lg:block border border-white/20 dark:border-gray-700/20" />
					</div>
				</div>
			</section>

			<section className="py-20 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl relative z-10 border-y border-white/20 dark:border-gray-800/20">
				<div className="max-w-7xl mx-auto px-4">
					<div className="text-center mb-16">
						<h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
							Powerful Features for Modern Workplaces
						</h2>
						<p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
							Everything you need to manage your workspace efficiently, from simple bookings to advanced analytics and integrations.
						</p>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-10">
						{features.map((feature, idx) => (
							<div
								key={idx}
								className="group flex items-start space-x-6 bg-white/30 dark:bg-gray-800/30 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 border border-white/20 dark:border-gray-700/20 hover:bg-white/40 dark:hover:bg-gray-800/40"
							>
								<div className="flex-shrink-0 p-3 bg-gradient-to-br from-white/50 to-white/20 dark:from-gray-700/50 dark:to-gray-700/20 rounded-xl group-hover:scale-110 transition-transform">
									{feature.icon}
								</div>
								<div>
									<h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">
										{feature.title}
									</h3>
									<p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
										{feature.description}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			<section className="py-20 bg-gradient-to-br from-blue-50/60 to-indigo-100/60 dark:from-gray-900/60 dark:to-indigo-950/60 relative z-10">
				<div className="max-w-7xl mx-auto px-4">
					<div className="text-center mb-16">
						<h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
							Advanced Capabilities
						</h2>
						<p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
							Take your workspace management to the next level with cutting-edge features designed for enterprise needs.
						</p>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
						{extraInfos.map((info, idx) => (
							<div
								key={idx}
								className="group flex flex-col items-center text-center bg-white/40 dark:bg-gray-800/40 rounded-2xl shadow-xl p-8 border border-white/20 dark:border-gray-700/20 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300"
							>
								<div className="p-4 bg-gradient-to-br from-white/60 to-white/30 dark:from-gray-700/60 dark:to-gray-700/30 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
									{info.icon}
								</div>
								<h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
									{info.title}
								</h4>
								<p className="text-gray-600 dark:text-gray-300 leading-relaxed">
									{info.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			<section className="py-20 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl relative z-10">
				<div className="max-w-6xl mx-auto px-4 text-center">
					<h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12">
						Built with Modern Technology
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
						{techStack.map((tech, idx) => (
							<div key={idx} className="bg-white/40 dark:bg-gray-800/40 rounded-xl p-6 border border-white/20 dark:border-gray-700/20">
								<h4 className={`text-lg font-bold mb-2 ${tech.color}`}>{tech.name}</h4>
								<p className="text-gray-600 dark:text-gray-300">{tech.description}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			

			<section className="py-20 bg-gradient-to-br from-blue-50/60 to-indigo-100/60 dark:from-gray-900/60 dark:to-indigo-950/60 relative z-10">
				<div className="max-w-7xl mx-auto px-4">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
							Trusted by Industry Leaders
						</h2>
						<p className="text-xl text-gray-600 dark:text-gray-300">
							See what our customers have to say about WorkReserve
						</p>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{testimonials.map((testimonial, idx) => (
							<div
								key={idx}
								className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-8 shadow-xl border border-white/20 dark:border-gray-700/20"
							>
								<div className="flex items-center mb-6">
									<div className="text-4xl mr-4">{testimonial.avatar}</div>
									<div>
										<div className="font-bold text-gray-900 dark:text-white">{testimonial.name}</div>
										<div className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</div>
									</div>
								</div>
								<div className="flex mb-4">
									{[...Array(testimonial.rating)].map((_, i) => (
										<svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
											<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
										</svg>
									))}
								</div>
								<blockquote className="text-gray-700 dark:text-gray-300 italic leading-relaxed">
									"{testimonial.quote}"
								</blockquote>
							</div>
						))}
					</div>
				</div>
			</section>

			<section className="py-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-800 dark:via-indigo-800 dark:to-purple-800 text-center relative z-10">
				<div className="max-w-4xl mx-auto px-4">
					<h3 className="text-4xl md:text-5xl font-bold mb-6 text-white">
						Ready to Transform Your Workspace?
					</h3>
					<p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
						Join thousands of organizations already using WorkReserve to optimize their workspace management.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-10 py-6 shadow-xl">
							<Link to="/register">Start For Free</Link>
						</Button>
						<Button asChild size="lg" variant="outline" className="border-white text-blue-600 hover:bg-gray/100 text-lg px-10 py-6">
							<Link to="/contact">Contact Sales</Link>
						</Button>
					</div>
				</div>
			</section>

			<footer className="py-12 bg-gray-900/80 dark:bg-gray-950/80 backdrop-blur-xl text-center relative z-10 border-t border-gray-800/50">
				<div className="max-w-6xl mx-auto px-4">
					<div className="flex flex-col md:flex-row justify-between items-center">
						<div className="flex items-center space-x-3 mb-4 md:mb-0">
							<img
								src="/src/assets/images/workreserve-icon-logo1.png"
								alt="WorkReserve Logo"
								className="w-8 h-8 object-contain"
							/>
							<span className="text-xl font-bold text-white">WorkReserve</span>
						</div>
						<div className="flex space-x-6 text-gray-300">
							<Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
							<Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
							<Link to="/support" className="hover:text-white transition-colors">Support</Link>
							<Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
						</div>
					</div>
					<div className="mt-8 pt-8 border-t border-gray-800 text-gray-400 text-sm">
						&copy; {new Date().getFullYear()} WorkReserve. All rights reserved. Built with ❤️ for modern workplaces.
					</div>
				</div>
			</footer>
		</div>
	);
};

export default LandingPage;