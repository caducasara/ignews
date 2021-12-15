import { NextApiRequest, NextApiResponse } from "next";
import { query as q } from 'faunadb';
import { getSession } from 'next-auth/client';
import { fauna } from "../../services/fauna";
import { stripe } from '../../services/stripe'


type User = {
  ref: {
    id: string;
  }
  data: {
    stripe_custuemer_id: string;
  }
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  //verificar se o tipo da requisição é POST
  //sempre que for criar alguma coisa no backend se usa o POST para
  if (req.method == 'POST') {
    const session = await getSession({ req });

    const user = await fauna.query<User>(
      q.Get(
        q.Match(
          q.Index('user_by_email'),
          q.Casefold(session.user.email)
        )
      )
    )

    let customerId = user.data.stripe_custuemer_id;

    if (!customerId) {
      const stripeCustomer = await stripe.customers.create({
        email: session.user.email,
        // metadata
      })

      await fauna.query(
        q.Update(
          q.Ref(q.Collection('users'), user.ref.id),
          {
            data: {
              stripe_custuemer_id: stripeCustomer.id
            }
          }
        )
      )

      customerId = stripeCustomer.id;
    }



    //caso seja do tipo POST, entao deve criar uma sessao no stripe
    const stripeCheckoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      line_items: [
        { price: 'price_1JxLGyExfQEXukJVZCePj9ZL', quantity: 1 }
      ],
      mode: 'payment',
      allow_promotion_codes: true,
      success_url: 'http://localhost:3000/posts',
      cancel_url: 'http://localhost:3000/'
    })

    return res.status(200).json({ sessionId: stripeCheckoutSession.id })
  } else {
    //caso nao seja post isso vai responder para o front que o metodo que esssa rota aceita é POST
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method not allowed!')
  }
}