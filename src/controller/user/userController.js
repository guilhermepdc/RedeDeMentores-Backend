import jwt from 'jsonwebtoken';
import admin from '../../database/connection';

require('dotenv').config();

const db = admin.firestore();

module.exports = {
  async get(request, response) {
    try {
      const { user } = request.body;
      if (!user) {
        return response
          .status(400)
          .json({ error: 'Não foram enviados os dados.' });
      }
      const userCollection = db.collection('user');
      let result = null;
      await userCollection
        .where('usuario', '==', user)
        .get()
        .then((snapshot) => {
          return snapshot.forEach((res) => {
            result = res.data();
          });
        });
      if (!result) {
        return response.status(400).json({ error: 'Não foi encontrado.' });
      }
      return response.status(200).json(result);
    } catch (e) {
      return response.status(500).json({
        error: `Erro durante o processamento do login. Espere um momento e tente novamente! Erro : ${e}`,
      });
    }
  },
  async insert(request, response) {
    try {
      const {
        user,
        cpf,
        mentorFlag,
        email,
        password,
        name,
        linkedin,
        phone,
      } = request.body;

      const userCollection = db.collection('user');

      let dbVerification = null;
      await userCollection
        .where('user', '==', user)
        .get()
        .then((snapshot) => {
          return snapshot.forEach((res) => {
            dbVerification = res.data();
          });
        });
      if (dbVerification) {
        return response.status(400).send({ error: 'Usuário já existe.' });
      }

      await userCollection.add({
        user,
        password,
        name,
        cpf,
        phone,
        linkedin,
        email,
        mentorFlag,
      });
      return response.status(201).send();
    } catch (e) {
      return response.status(500).json({
        error: `Erro durante o processamento do login. Espere um momento e tente novamente! Erro : ${e}`,
      });
    }
  },

  async update(request, response) {
    try {
      const {
        user,
        cpf,
        mentorFlag,
        email,
        password,
        name,
        linkedin,
        phone,
      } = request.body;

      const userCollection = db.collection('user');

      let dbVerification = null;
      await userCollection
        .where('user', '==', user)
        .get()
        .then((snapshot) => {
          return snapshot.forEach((res) => {
            dbVerification = res.id;
          });
        });
      if (!dbVerification) {
        return response.status(400).send({ error: 'Usuário não existe.' });
      }

      await userCollection.doc(dbVerification).set({
        user,
        password,
        name,
        cpf,
        phone,
        linkedin,
        email,
        mentorFlag,
      });
      return response.status(200).send();
    } catch (e) {
      return response.status(500).json({
        error: `Erro durante o processamento do login. Espere um momento e tente novamente! Erro : ${e}`,
      });
    }
  },

  async delete(request, response) {
    try {
      const { user } = request.body;

      const userCollection = db.collection('user');

      let dbVerification = null;
      await userCollection
        .where('user', '==', user)
        .get()
        .then((snapshot) => {
          return snapshot.forEach((res) => {
            dbVerification = res.id;
          });
        });
      if (!dbVerification) {
        return response.status(400).send({ error: 'Usuário não existe.' });
      }

      await userCollection.doc(dbVerification).delete();
      return response.status(200).send();
    } catch (e) {
      return response.status(500).json({
        error: `Erro durante o processamento do login. Espere um momento e tente novamente! Erro : ${e}`,
      });
    }
  },

  async login(request, response) {
    try {
      const { user, password } = request.body;

      if (!user || !password) {
        return response
          .status(404)
          .json({ error: 'Não foram enviados os dados.' });
      }
      const userCollection = db.collection('user');
      let result = null;
      await userCollection
        .where('usuario', '==', user)
        .where('password', '==', password)
        .get()
        .then((snapshot) => {
          return snapshot.forEach((res) => {
            result = res.data();
          });
        });

      if (!result) {
        return response.status(401).json({ error: 'Erro de autenticação!' });
      }
      const token = jwt.sign(
        {
          cpf: result.cpf,
          email: result.email,
        },
        process.env.JWT_KEY,
        {
          expiresIn: '1h',
        }
      );

      return response.status(200).json({ token });
    } catch (e) {
      return response.status(500).json({
        error: `Erro durante o processamento do login. Espere um momento e tente novamente! Erro : ${e}`,
      });
    }
  },
};
