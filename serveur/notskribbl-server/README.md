Note: des codes seront ajoutés éventuellement

# join_chatroom

Ajouter un utilisateur à un chatroom.

### Paramètres

| Paramètre | Type   | Description          |
| --------- | ------ | -------------------- |
| username  | string | Le nom d'utilisateur |
| room      | string | La room à rejoindre  |

### Codes

| Code | Description                        |
| ---- | ---------------------------------- |
| 1    | Succès                             |
| 2    | Échec pour une raison indéterminée |
| 3    | Il manque un champ dans la requète |

# leave_chatroom

Retirer un utilisateur d'un chatroom.

### Paramètres

| Paramètre | Type   | Description          |
| --------- | ------ | -------------------- |
| username  | string | Le nom d'utilisateur |
| room      | string | La room à rejoindre  |

### Codes

| Code | Description                        |
| ---- | ---------------------------------- |
| 1    | Succès                             |
| 2    | Échec pour une raison indéterminée |
| 3    | Il manque un champ dans la requète |

# chatroom_message

Envoyer un message dans le chatroom dans lequel l'utilisateur se trouve.

### Paramètres

| Paramètre | Type   | Description          |
| --------- | ------ | -------------------- |
| username  | string | Le nom d'utilisateur |
| room      | string | La room à rejoindre  |
| message   | string | Le message à envoyer |

### Codes

| Code | Description                        |
| ---- | ---------------------------------- |
| 1    | Succès                             |
| 2    | Échec pour une raison indéterminée |
| 3    | Il manque un champ dans la requète |

# create_user

Créer un nouvel utilisateur et l'ajouter à la base de données

### Paramètres

| Paramètre  | Type   | Description                        |
| ---------- | ------ | ---------------------------------- |
| username   | string | Le nom d'utilisateur               |
| first_name | string | Le prénom de l'utilisateur         |
| last_name  | string | Le nom de famille de l'utilisateur |
| password   | string | Le mot de passe de l'utilisateur   |

### Codes

| Code | Description                        |
| ---- | ---------------------------------- |
| 1    | Succès                             |
| 2    | Échec pour une raison indéterminée |
| 3    | Il manque un champ dans la requète |
| 4    | L'utilisateur existe déjà          |

# authenticate_user

Authentifier un utilisateur

### Paramètres

| Paramètre | Type   | Description                      |
| --------- | ------ | -------------------------------- |
| username  | string | Le nom d'utilisateur             |
| password  | string | Le mot de passe de l'utilisateur |

### Codes

| Code | Description                        |
| ---- | ---------------------------------- |
| 1    | Succès de l'authentification       |
| 2    | Échec pour une raison indéterminée |
| 3    | Il manque un champ dans la requète |
| 4    | Échec de l'authentification        |
