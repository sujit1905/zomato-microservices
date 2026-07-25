import amqp from "amqplib";

let channel: amqp.Channel | null = null;

const reconnectDelayMs = 5000;

export const connectRabbitMQ = async () => {
  if (channel) return channel;

  while (true) {
    try {
      const connection = await amqp.connect(process.env.RABBITMQ_URL!);

      channel = await connection.createChannel();

      await channel.assertQueue(process.env.RIDER_QUEUE!, {
        durable: true,
      });
      await channel.assertQueue(process.env.ORDER_READY_QUEUE!, {
        durable: true,
      });

      console.log("🐇 connected To Rabbitmq(rider service)");
      return channel;
    } catch (error) {
      await new Promise((resolve) => setTimeout(resolve, reconnectDelayMs));
    }
  }
};

export const getChannel = () => channel;
