import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

interface Review {
  id: string;
  nickname: string;
  rating: number;
  text: string;
  date: string;
  is_visible: boolean;
}

const ADMIN_CODE = 'stepan12';
const API_URL = 'https://functions.poehali.dev/ec54e918-a263-4161-8343-2886261858ce';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_CODE) {
      setIsAuthenticated(true);
      setError('');
      loadReviews();
    } else {
      setError('Неверный код доступа');
    }
  };

  const loadReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Code': ADMIN_CODE
        },
        body: JSON.stringify({ action: 'get_all' })
      });
      const data = await response.json();
      setReviews(data);
    } catch (err) {
      console.error('Error loading reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = async (reviewId: string) => {
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Code': ADMIN_CODE
        },
        body: JSON.stringify({ action: 'toggle_visibility', review_id: reviewId })
      });
      loadReviews();
    } catch (err) {
      console.error('Error toggling visibility:', err);
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот отзыв?')) return;
    
    try {
      await fetch(`${API_URL}?id=${reviewId}`, {
        method: 'DELETE',
        headers: {
          'X-Admin-Code': ADMIN_CODE
        }
      });
      loadReviews();
    } catch (err) {
      console.error('Error deleting review:', err);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Icon
            key={star}
            name="Star"
            size={16}
            className={`${star <= rating ? 'fill-accent text-accent' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md rounded-3xl border-2 bg-white/90 backdrop-blur shadow-2xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Админ-панель
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Код доступа</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите код"
                  className="rounded-2xl border-2 focus:border-primary"
                  required
                />
              </div>
              {error && (
                <p className="text-destructive text-sm text-center">{error}</p>
              )}
              <Button
                type="submit"
                className="w-full rounded-full py-6 text-lg bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all"
              >
                Войти
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
                className="w-full rounded-full"
              >
                Вернуться на главную
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Админ-панель MegaSchoolChat
          </h1>
          <div className="flex gap-4">
            <Button
              onClick={loadReviews}
              variant="outline"
              className="rounded-full"
            >
              <Icon name="RefreshCw" size={16} className="mr-2" />
              Обновить
            </Button>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="rounded-full"
            >
              <Icon name="Home" size={16} className="mr-2" />
              На главную
            </Button>
            <Button
              onClick={() => setIsAuthenticated(false)}
              variant="destructive"
              className="rounded-full"
            >
              <Icon name="LogOut" size={16} className="mr-2" />
              Выйти
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <Card className="rounded-3xl border-2 bg-white/90 backdrop-blur shadow-xl mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">
              Статистика
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl">
                <p className="text-3xl font-bold text-primary">{reviews.length}</p>
                <p className="text-sm text-foreground/70">Всего отзывов</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-2xl">
                <p className="text-3xl font-bold text-secondary">
                  {reviews.filter(r => r.is_visible).length}
                </p>
                <p className="text-sm text-foreground/70">Опубликовано</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-accent/10 to-accent/5 rounded-2xl">
                <p className="text-3xl font-bold text-accent">
                  {reviews.filter(r => !r.is_visible).length}
                </p>
                <p className="text-sm text-foreground/70">Скрыто</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="text-center py-12">
            <Icon name="Loader2" size={48} className="animate-spin text-primary mx-auto" />
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card
                key={review.id}
                className={`rounded-3xl border-2 transition-all ${
                  review.is_visible ? 'bg-white/90' : 'bg-gray-100/90 opacity-60'
                } backdrop-blur`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                          {review.nickname.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{review.nickname}</h3>
                          <p className="text-xs text-foreground/50">{review.date}</p>
                        </div>
                      </div>
                      <div className="mb-2">
                        {renderStars(review.rating)}
                      </div>
                      <p className="text-foreground/80">{review.text}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant={review.is_visible ? 'outline' : 'default'}
                        onClick={() => toggleVisibility(review.id)}
                        className="rounded-full"
                      >
                        <Icon
                          name={review.is_visible ? 'EyeOff' : 'Eye'}
                          size={16}
                          className="mr-2"
                        />
                        {review.is_visible ? 'Скрыть' : 'Показать'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteReview(review.id)}
                        className="rounded-full"
                      >
                        <Icon name="Trash2" size={16} className="mr-2" />
                        Удалить
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
