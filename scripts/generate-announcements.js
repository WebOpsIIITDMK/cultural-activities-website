import sanity from '@sanity/client';
import dotenv from 'dotenv';
import { promises as fsp } from 'fs';

dotenv.config({ path: '../.env' });

const client = sanity({
	apiVersion: '2021-09-07',
	projectId: process.env.SANITY_PROJECT_ID,
	dataset: process.env.SANITY_DATASET,
	token: process.env.SANITY_TOKEN,
	useCdn: false,
});

async function main() {
	/** @type {import('./types').SanityAnnouncement[]} */
	const events = await client.fetch('*[_type == "announcement"]');

	/** @type {import('./types').Announcement[]} */
	const finalEvents = [];

	// Now process images
	for (const event of events) {
		/** @type {import('./types').Announcement} */
		const eventObj = {
			datetime: event.date_time,
			eventDescription: event.event_description,
			eventName: event.event_name,
			link: event.link,
			name: event.name,
			past: event.past,
		};

		finalEvents.push(eventObj);
	}

	const activeEvents = finalEvents.filter(({ past }) => !past);
	const pastEvents = finalEvents.filter(({ past }) => past);

	fsp.writeFile('../static/data/active-events.json', JSON.stringify(activeEvents));
	fsp.writeFile('../static/data/past-events.json', JSON.stringify(pastEvents));
}

main();
