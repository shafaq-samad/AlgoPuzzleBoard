using AlgoPuzzleBoard.MVC.Data;
using AlgoPuzzleBoard.MVC.Models;
using Microsoft.EntityFrameworkCore;

namespace AlgoPuzzleBoard.MVC.Services
{
    public class AuthService
    {
        private readonly ApplicationDbContext _context;

        public AuthService(ApplicationDbContext context)
        {
            _context = context;
        }

        public bool ValidateUser(string username, string password)
        {
            var user = _context.Users.FirstOrDefault(u => u.Username == username);
            
            if (user == null) return false;
            
            // In a real app, use hashing (BCrypt/Argon2). 
            // Comparing plain text as requested for implementation simplicity unless requested otherwise.
            return user.Password == password;
        }

        public bool UserExists(string username)
        {
            return _context.Users.Any(u => u.Username == username);
        }

        public void RegisterUser(string username, string password)
        {
            if (UserExists(username)) return;

            var user = new User 
            { 
                Username = username, 
                Password = password,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            _context.SaveChanges();
        }
    }
}
