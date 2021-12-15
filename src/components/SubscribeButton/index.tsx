import { useSession, signIn } from 'next-auth/client';
import { useRouter } from 'next/router';
import { api } from '../../services/api';
import { getStripeJs } from '../../services/stripe-js';
import styles from './styles.module.scss';

interface SubscribeButtonProps {
  priceId: String;
}

export function SubscribeButton({ priceId }: SubscribeButtonProps) {
  //estado que verifica se o usario esta logado ou nao, estado de dentro do proprio nextAuth
  const [session] = useSession();
  const router = useRouter();

  //funcao que sera executada quando o usario clicar no botao
  async function handleSubscribeButton() {
    //verifica se o usario esta logado ou nao
    if (!session) {
      // se estiver logado executa a função signIn, função de dentro do proprio nextAuth
      signIn('github');
      return; // return apenas para que o codigo apartir daqui nao seja executado
    }

    if (session.activeSubscription) {
      router.push('/posts');
      return;
    }

    // fazer checkout session no stripe (arquivo: subscribe.ts)
    //redirecionar usuario para rota
    try {
      const response = await api.post('/subscribe')

      const { sessionId } = response.data;

      const stripe = await getStripeJs();

      await stripe.redirectToCheckout({ sessionId });
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <button
      type="button"
      className={styles.subscribeButton}
      onClick={handleSubscribeButton}
    >
      Subscribe now
    </button>
  )
}