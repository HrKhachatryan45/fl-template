import React from 'react';
import { Link } from 'react-router-dom';
import { Flower2, Phone, Mail, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-secondary/10 border-t border-border mt-20">
      <div className="container mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary rounded-full p-2">
                <Flower2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-serif font-bold text-primary">Ձաղիկ</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Հայաստանի լավագույն ծաղկի խանութը։ Մենք մատուցում ենք թարմ և գեղեցիկ ծաղիկներ յուրաքանչյուր առիթի համար։
            </p>
          </div>

          <div>
            <h3 className="font-serif text-lg font-semibold mb-4">Արագ հղումներ</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Գլխավոր
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-muted-foreground hover:text-primary transition-colors">
                  Ծաղիկներ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Կապ
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-muted-foreground hover:text-primary transition-colors">
                  Ադմին
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg font-semibold mb-4">Կապ</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>+374 10 123456</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>info@dzaghik.am</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>Երևան, Հայաստան</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} Ձաղիկ։ Բոլոր իրավունքները պաշտպանված են։</p>
        </div>
      </div>
    </footer>
  );
};
