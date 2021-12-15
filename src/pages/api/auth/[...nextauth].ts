import { query as q } from 'faunadb'

import NextAuth from "next-auth"
import Providers from "next-auth/providers"

import { fauna } from '../../../services/fauna'


export default NextAuth({
  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRETS,
      scope: 'read:user'
    }),
  ],
  callbacks: {
    async session(session) {

      try {
        const userActive = await fauna.query(
          q.Get(
            q.Intersection([
              q.Match(
                q.Index('subscription_by_user_ref'),
                q.Select(
                  "ref",
                  q.Get(
                    q.Match(
                      q.Index('user_by_email'),
                      q.Casefold(session.user.email)
                    )
                  )
                )
              ),
              q.Match(
                q.Index('subscription_by_status'),
                "succeeded"
              )
            ])
          )
        )

        return {
          ...session,
          activeSubscription: userActive
        };
      } catch {
        return {
          ...session,
          activeSubscription: null
        }
      }
    },
    async signIn(user, account, profile) {

      const { email } = user;

      try {
        await fauna.query(
          q.If(
            q.Not(
              q.Exists(
                q.Match( // juntando toda a sequencias de verificação: se nao existe um usario no qual ele realize um match
                  q.Index('user_by_email'), //procura o match pelo indice criado no banco 'user_by_email' 
                  q.Casefold(user.email) // user.email: pega o email do usuario para verificar no match/CaseFold padroniza todas as letras em minusculas para poder pesquisar
                )
              )
            ),
            //se a verificação feita acima for verdadeira executa a função abaixo
            q.Create(
              q.Collection('users'), { // cria na coleção users um ursuario com o email fornecido
              data: {
                email
              }
            }
            ),
            //caso a verificação acima seja falsa executa o codigo abaixo
            q.Get( // como se fosse um select dentro do sql
              q.Match(
                q.Index('user_by_email'), //busca no banco o ususario pelo indice "user_by_email" e verifica qual usuario da match
                q.Casefold(user.email) // novamente comando Casefold para deixar todas letras minusculas para verificar
              )
            )
          )
        )
        return true;

      } catch {
        return false;
      }

    }
  }
})