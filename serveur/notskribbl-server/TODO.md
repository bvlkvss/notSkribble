# Todo list
- Valider qu'un utilisateur a le droit de se joindre a un PrivateChatroom (voir TODO)
- Pour éviter de surcharger le serveur on delete les rooms privé quand personne n'est connecté dans la room

# Chatrooms brainstorm
- Comment un client récupère les logs?
- Envoyés automatiquement?
- Envoyés sur demande?

---

- Est-ce qu'un user est connecté à toutes ses chatrooms quand il se connecte?
- Si oui comment faire?

---

- Comment faire pour qu'un user soit connecté à plusieurs chatrooms en même temps (privé et public par exemple)
- Est-ce qu'on pourrait envoyer le nom de la chatroom quand on envoie un message au client?
- De cette manière il saurait de quelle room le message vient
- En ce moment le client ne sait pas de quelle room le message vient et donc il ne saurait pas dans laquelle le placer

# Private chatroom brainstorm
- Comment empêcher un user de créer une chatroom publique qui porte le même nom qu'un chat privé
- Cela permettrait à tort les users de s'infiltrer dans un chatroom privé

---

- user1 envoie un message à user2
- Le serveur regarde si un chatroom dans la DB existe deja et la load, sinon la cree
- le serveur connecte les deux users a la room
- si user2 n'est pas connecte, envoyer une erreur a user1

# Autre
Quand un user se connecte à une room, pourquoi elle n'est pas ajoutée à sa liste de chatrooms?
