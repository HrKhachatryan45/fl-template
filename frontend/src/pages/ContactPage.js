import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Ձեր հաղորդագրությունը ուղարկված է!', {
      description: 'Մենք կապ կհաստատենք ձեզ հետ շուտով'
    });
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            Կապ մեզ հետ
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ունե՞ք հարցեր։ Մենք այստեղ ենք օգնելու։
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-3xl font-serif font-bold mb-8">Գրեք մեզ</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Անուն *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/50 border-border focus:border-primary/50 focus:ring-primary/20 rounded-lg"
                  placeholder="Ձեր անունը"
                  required
                  data-testid="contact-name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Էլ. փոստ *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/50 border-border focus:border-primary/50 focus:ring-primary/20 rounded-lg"
                  placeholder="email@example.com"
                  required
                  data-testid="contact-email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Հեռախոս
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/50 border-border focus:border-primary/50 focus:ring-primary/20 rounded-lg"
                  placeholder="+374 XX XXXXXX"
                  data-testid="contact-phone"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Հաղորդագրություն *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  className="w-full px-4 py-3 bg-white/50 border-border focus:border-primary/50 focus:ring-primary/20 rounded-lg"
                  placeholder="Ինչպե՞ս կարող ենք օգնել..."
                  required
                  data-testid="contact-message"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-4 font-medium transition-all shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2 active:scale-95"
                data-testid="contact-submit"
              >
                <Send className="w-5 h-5" />
                <span>Ուղարկել հաղորդագրություն</span>
              </button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-3xl font-serif font-bold mb-8">Կապի տվյալներ</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-border/50 shadow-sm">
                  <div className="bg-primary/10 p-3 rounded-full flex-shrink-0">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Հեռախոս</h3>
                    <p className="text-muted-foreground">+374 10 123456</p>
                    <p className="text-muted-foreground">+374 99 123456</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-border/50 shadow-sm">
                  <div className="bg-primary/10 p-3 rounded-full flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Էլ. փոստ</h3>
                    <p className="text-muted-foreground">info@dzaghik.am</p>
                    <p className="text-muted-foreground">support@dzaghik.am</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-border/50 shadow-sm">
                  <div className="bg-primary/10 p-3 rounded-full flex-shrink-0">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Հասցե</h3>
                    <p className="text-muted-foreground">
                      Աբովյան փ. 10<br />
                      Երևան 0001<br />
                      Հայաստան
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-secondary/10 rounded-2xl p-8 border border-secondary/20">
              <h3 className="font-serif text-xl font-semibold mb-3">Աշխատանքային ժամեր</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>Երկուշաբթի - Շաբաթ: 09:00 - 20:00</p>
                <p>Կիրակի: 10:00 - 18:00</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
