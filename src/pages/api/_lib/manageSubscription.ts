import { fauna } from "../../../services/fauna";
import { query as q } from 'faunadb';
import { stripe } from "../../../services/stripe";

export async function saveSubscription(
  subscriptionId: string,
  customerId: string,
  createAction = false
) {
  //buscar usuario no banco do fauna com o id {custumerId}
  const userRef = await fauna.query(
    q.Select(
      "ref",
      q.Get(
        q.Match(
          q.Index('user_by_stripe_customer_id'),
          customerId
        )
      )
    )
  )

  //salvar os dados da subscription no FaunaDB

  const subscription = await stripe.paymentIntents.retrieve(subscriptionId)

  const subscriptionData = {
    id: subscription.id,
    userId: userRef,
    status: subscription.status,
    price_id: subscription.amount, //id de preço esta incorreto
  }

  if (createAction) {
    await fauna.query(
      q.Create(
        q.Collection('subscriptions'),
        {
          data: subscriptionData
        }
      )
    )
  } else {
    await fauna.query(
      q.Replace(
        q.Select(
          "ref",
          q.Get(
            q.Match(
              q.Index('subscription_by_id'),
              subscriptionId,
            )
          )
        ),
        {
          data: {
            subscriptionData
          }
        }
      )
    )
  }


}