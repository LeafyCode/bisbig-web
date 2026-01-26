import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
	component: PrivacyPolicyComponent,
	head: () => ({
		meta: [
			{
				title: "Privacy Policy",
			},
			{
				name: "description",
				content: "Our privacy policy and data protection practices",
			},
		],
	}),
});

function PrivacyPolicyComponent() {
	return (
		<div className="min-h-screen bg-white">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
				<p className="text-gray-600 mb-8">
					Last updated: {new Date().toLocaleDateString()}
				</p>

				<section className="space-y-6">
					<div>
						<h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
						<p className="text-gray-700 leading-relaxed">
							We are committed to protecting your privacy. This Privacy Policy
							explains how we collect, use, disclose, and safeguard your
							information when you visit our website.
						</p>
					</div>

					<div>
						<h2 className="text-2xl font-semibold mb-4">
							2. Information We Collect
						</h2>
						<p className="text-gray-700 leading-relaxed mb-3">
							We may collect information about you in a variety of ways. The
							information we may collect on the site includes:
						</p>
						<ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
							<li>Personal identification information (name, email, etc.)</li>
							<li>Navigational information about your browsing activity</li>
							<li>Device information (browser type, IP address, etc.)</li>
							<li>Usage information about how you interact with our services</li>
						</ul>
					</div>

					<div>
						<h2 className="text-2xl font-semibold mb-4">3. Use of Your Information</h2>
						<p className="text-gray-700 leading-relaxed mb-3">
							Having accurate information about you permits us to provide you
							with a smooth, efficient, and customized experience. Specifically,
							we may use information collected about you via the site to:
						</p>
						<ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
							<li>Generate analytics about how you use our site</li>
							<li>Fulfill and manage your requests</li>
							<li>Send periodic emails regarding your order or other products</li>
							<li>
								Improve our site based on feedback and information we receive
							</li>
							<li>Monitor and analyze trends, usage, and activities</li>
						</ul>
					</div>

					<div>
						<h2 className="text-2xl font-semibold mb-4">4. Disclosure of Your Information</h2>
						<p className="text-gray-700 leading-relaxed">
							We may share your information in the following situations:
						</p>
						<ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-3">
							<li>By law or to protect our rights</li>
							<li>With service providers who assist us in operating our website</li>
							<li>With third-party partners (only with your consent)</li>
						</ul>
					</div>

					<div>
						<h2 className="text-2xl font-semibold mb-4">5. Security of Your Information</h2>
						<p className="text-gray-700 leading-relaxed">
							We use administrative, technical, and physical security measures to
							protect your personal information. However, no method of transmission
							over the Internet or method of electronic storage is 100% secure.
						</p>
					</div>

					<div>
						<h2 className="text-2xl font-semibold mb-4">6. Contact Us</h2>
						<p className="text-gray-700 leading-relaxed">
							If you have questions or comments about this Privacy Policy, please
							contact us at:
						</p>
						<div className="mt-3 text-gray-700">
							<p>Email: root@leafycode.com</p>
							<p>Address: leafycode international</p>
						</div>
					</div>

					<div>
						<h2 className="text-2xl font-semibold mb-4">7. Changes to This Privacy Policy</h2>
						<p className="text-gray-700 leading-relaxed">
							We may update this Privacy Policy from time to time in order to
							reflect, for example, changes to our practices or for other
							operational, legal, or regulatory reasons. We will notify you of
							any changes by updating the "Last updated" date of this Privacy
							Policy.
						</p>
					</div>
				</section>
			</div>
		</div>
	);
}
