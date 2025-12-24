import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

interface Review {
  id: string;
  nickname: string;
  rating: number;
  text: string;
  date: string;
}

const Index = () => {
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: '1',
      nickname: 'Александра',
      rating: 5,
      text: 'Невероятный инструмент! MegaSchoolChat помог мне организовать обучение для целого класса. Рекомендую всем учителям!',
      date: '2024-12-20'
    },
    {
      id: '2',
      nickname: 'Дмитрий',
      rating: 4,
      text: 'Отличная нейросеть для образования. Иногда бывают задержки, но в целом работает стабильно.',
      date: '2024-12-18'
    },
    {
      id: '3',
      nickname: 'Мария',
      rating: 5,
      text: 'Просто WOW! Ученики в восторге, материал усваивается намного лучше. Спасибо разработчикам!',
      date: '2024-12-15'
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nickname: '',
    rating: 5,
    text: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newReview: Review = {
      id: Date.now().toString(),
      nickname: formData.nickname,
      rating: formData.rating,
      text: formData.text,
      date: new Date().toISOString().split('T')[0]
    };
    setReviews([newReview, ...reviews]);
    setFormData({ nickname: '', rating: 5, text: '' });
    setIsDialogOpen(false);
  };

  const renderStars = (rating: number, interactive: boolean = false, onRate?: (rate: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onRate && onRate(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-125 transition-transform' : ''}`}
            disabled={!interactive}
          >
            <Icon
              name={star <= rating ? 'Star' : 'Star'}
              size={interactive ? 28 : 20}
              className={`${star <= rating ? 'fill-accent text-accent' : 'text-gray-300'} transition-all`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            MegaSchoolChat
          </h1>
          <div className="flex gap-4 items-center">
            <a
              href="#reviews"
              className="text-foreground/80 hover:text-primary transition-colors font-medium"
            >
              Отзывы
            </a>
            <a
              href="https://ai-school-tools--preview.poehali.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/80 hover:text-primary transition-colors font-medium flex items-center gap-2"
            >
              Официальный сайт
              <Icon name="ExternalLink" size={16} />
            </a>
            <a
              href="#contacts"
              className="text-foreground/80 hover:text-primary transition-colors font-medium"
            >
              Контакты
            </a>
          </div>
        </div>
      </nav>

      <section className="container mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-scale-in">
            Отзывы о MegaSchoolChat
          </h2>
          <p className="text-xl text-foreground/70 mb-8 animate-slide-up">
            Узнайте, что говорят пользователи о нашей нейросети для образования
          </p>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="text-lg px-8 py-6 rounded-full shadow-2xl hover:shadow-primary/50 transition-all hover:scale-105 bg-gradient-to-r from-primary to-secondary"
              >
                <Icon name="PenLine" size={20} className="mr-2" />
                Написать отзыв
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Новый отзыв
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Ваш никнейм</label>
                  <Input
                    required
                    value={formData.nickname}
                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                    placeholder="Введите имя"
                    className="rounded-2xl border-2 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Оценка</label>
                  {renderStars(formData.rating, true, (rating) => setFormData({ ...formData, rating }))}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Ваш отзыв</label>
                  <Textarea
                    required
                    value={formData.text}
                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                    placeholder="Поделитесь впечатлениями..."
                    className="rounded-2xl border-2 focus:border-primary min-h-[120px]"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full rounded-full py-6 text-lg bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all"
                >
                  Отправить отзыв
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      <section id="reviews" className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <Card
              key={review.id}
              className="overflow-hidden rounded-3xl border-2 hover:border-primary transition-all hover:shadow-2xl hover:-translate-y-2 animate-scale-in bg-white/90 backdrop-blur"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">
                      {review.nickname.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{review.nickname}</h3>
                      <p className="text-xs text-foreground/50">{review.date}</p>
                    </div>
                  </div>
                </div>
                <div className="mb-3">
                  {renderStars(review.rating)}
                </div>
                <p className="text-foreground/80 leading-relaxed">{review.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="contacts" className="container mx-auto px-4 py-20 text-center">
        <Card className="max-w-2xl mx-auto rounded-3xl border-2 bg-white/90 backdrop-blur shadow-2xl animate-fade-in">
          <CardContent className="p-12">
            <h3 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Контакты
            </h3>
            <div className="space-y-4 text-lg">
              <p className="flex items-center justify-center gap-3">
                <Icon name="Globe" size={24} className="text-primary" />
                <a
                  href="https://ai-school-tools--preview.poehali.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  ai-school-tools--preview.poehali.dev
                </a>
              </p>
              <p className="flex items-center justify-center gap-3">
                <Icon name="Mail" size={24} className="text-primary" />
                <span className="text-foreground/70">contact@megaschoolchat.ru</span>
              </p>
              <p className="flex items-center justify-center gap-3">
                <Icon name="MessageCircle" size={24} className="text-primary" />
                <span className="text-foreground/70">Телеграм: @megaschoolchat</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <footer className="bg-gradient-to-r from-primary via-secondary to-accent text-white py-8 mt-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg font-medium">© 2024 MegaSchoolChat. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
