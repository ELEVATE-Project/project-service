require('dotenv').config({ path: '../.env' })
const kafka = require('kafka-node')

// Remote Kafka broker IP and port
const kafkaHost = process.env.KAFKA_URL // change if needed
const topic = process.env.ORGANIZATION_EXTENSION_TOPIC

const [code, tenantId] = process.argv.slice(2)

// Create Kafka client
const client = new kafka.KafkaClient({ kafkaHost })

// Create producer
const producer = new kafka.Producer(client)

producer.on('ready', function () {
	console.log('Kafka Producer is connected and ready.')

	// Create message payload
	const payloads = [
		{
			topic: topic,
			messages: JSON.stringify({
				entity: 'organization',
				eventType: 'create',
				code: code,
				tenant_code: tenantId,
				status: 'ACTIVE',
				deleted: false,
			}),
		},
	]

	// Send message
	producer.send(payloads, (err, data) => {
		if (err) {
			console.error('Error sending message:', err)
		} else {
			console.log('Message sent successfully:', data)
		}
		process.exit(0) // exit after sending
	})
})

producer.on('error', function (err) {
	console.error('Producer error:', err)
})
