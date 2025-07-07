import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

const features = [
	{
		title: 'Workspace Booking',
		description:
			'Reserve desks, rooms, or resources with a few clicks. See real-time availability and manage your bookings easily.',
		icon: (
			<svg
				className="w-8 h-8 text-blue-600"
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
		title: 'User Management',
		description:
			'Register, verify your email, reset your password, and manage your profile securely.',
		icon: (
			<svg
				className="w-8 h-8 text-green-600"
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
		title: 'Admin Dashboard',
		description:
			'Admins can manage users, rooms, and reservations, view analytics, and control access.',
		icon: (
			<svg
				className="w-8 h-8 text-indigo-600"
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
		title: 'Secure & Reliable',
		description:
			'Built with modern security best practices: JWT, rate limiting, email verification, and more.',
		icon: (
			<svg
				className="w-8 h-8 text-emerald-600"
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

const moreInfos = [
	{
		title: 'Mobile Friendly',
		description:
			'Access WorkReserve on any device. Our responsive design ensures a seamless experience everywhere.',
	},
	{
		title: 'Calendar Integration',
		description:
			'Sync your bookings with Google Calendar or Outlook for better scheduling.',
	},
	{
		title: 'Notifications',
		description:
			'Get instant email notifications for bookings, cancellations, and reminders.',
	},
	{
		title: 'Support',
		description:
			'Our team is ready to help you 24/7 via chat and email.',
	},
];

const LandingPage: React.FC = () => {
	const [dark, setDark] = useState(false);

	useEffect(() => {
		if (dark) {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	}, [dark]);

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col transition-colors">
			<header className="w-full py-6 px-4 flex justify-between items-center bg-white/80 dark:bg-gray-900/80 shadow-sm">
				<div className="flex items-center space-x-3">
					<img
						src="/src/assets/images/workreserve-icon-logo1.png"
						alt="WorkReserve Logo"
						className="w-12 h-12 object-contain"
					/>
					<span className="text-2xl font-bold text-blue-700 dark:text-blue-300 tracking-tight">
						WorkReserve
					</span>
				</div>
				<div className="flex items-center space-x-2">
					<Button asChild variant="outline">
						<Link to="/login">Sign In</Link>
					</Button>
					<Button asChild>
						<Link to="/register">Get Started</Link>
					</Button>
					<Button
						variant="ghost"
						aria-label="Toggle dark mode"
						onClick={() => setDark((d) => !d)}
						className="ml-2"
					>
						{dark ? (
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

			<section className="flex-1 flex flex-col justify-center items-center text-center px-4 py-16">
				<h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4 leading-tight">
					Effortless Workspace{' '}
					<span className="text-blue-600">Reservation</span>
				</h1>
				<p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl">
					WorkReserve helps you book, manage, and optimize your workspace.
					<br className="hidden sm:block" /> Whether you’re a team member or an
					admin, our platform streamlines the reservation process and keeps your
					workspace organized.
				</p>
				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<Button asChild size="lg">
						<Link to="/register">Create Free Account</Link>
					</Button>
					<Button asChild size="lg" variant="outline">
						<Link to="/login">Sign In</Link>
					</Button>
				</div>
			</section>

			<section className="py-16 bg-white/80 dark:bg-gray-900/80">
				<div className="max-w-5xl mx-auto px-4">
					<h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-10">
						Why Choose WorkReserve?
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						{features.map((feature, idx) => (
							<div
								key={idx}
								className="flex items-start space-x-4 bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
							>
								<div>{feature.icon}</div>
								<div>
									<h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-1">
										{feature.title}
									</h3>
									<p className="text-gray-600 dark:text-gray-300">
										{feature.description}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			<section className="py-12 bg-blue-50 dark:bg-gray-800">
				<div className="max-w-4xl mx-auto px-4">
					<h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
						More Features
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
						{moreInfos.map((info, idx) => (
							<div
								key={idx}
								className="bg-white dark:bg-gray-700 rounded-lg shadow p-5"
							>
								<h4 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-2">
									{info.title}
								</h4>
								<p className="text-gray-700 dark:text-gray-200">
									{info.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			<section className="py-12 bg-gradient-to-r from-blue-100 to-indigo-100 text-center">
				<h3 className="text-2xl font-bold mb-4 text-gray-900">
					Ready to get started?
				</h3>
				<Button asChild size="lg" className="text-lg px-8 py-4">
					<Link to="/register">Sign Up Now</Link>
				</Button>
			</section>

			<footer className="py-6 text-center text-gray-400 text-sm">
				&copy; {new Date().getFullYear()} WorkReserve. All rights reserved.
			</footer>
		</div>
	);
};

export default LandingPage;