# train.py — Neural SDF training script (basic DeepSDF style)

import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
import os

class SDFMLP(nn.Module):
    def __init__(self, hidden_dim=128):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(3, hidden_dim), nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim), nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim), nn.ReLU(),
            nn.Linear(hidden_dim, 1)  # Output: SDF value
        )

    def forward(self, x):
        return self.net(x)

def load_sdf_samples(path):
    data = np.load(path)
    coords = torch.tensor(data['coords'], dtype=torch.float32)  # (N, 3)
    sdf = torch.tensor(data['sdf'], dtype=torch.float32).unsqueeze(1)  # (N, 1)
    return coords, sdf

def train(model, coords, sdf, lr=1e-4, epochs=1000):
    optimizer = optim.Adam(model.parameters(), lr=lr)
    criterion = nn.MSELoss()

    for epoch in range(epochs):
        optimizer.zero_grad()
        pred = model(coords)
        loss = criterion(pred, sdf)
        loss.backward()
        optimizer.step()

        if epoch % 100 == 0:
            print(f"Epoch {epoch}: loss = {loss.item():.6f}")

    return model

def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--data', type=str, required=True, help='Path to .npz with coords and sdf')
    parser.add_argument('--out', type=str, default='sdf_model.pth')
    args = parser.parse_args()

    coords, sdf = load_sdf_samples(args.data)
    model = SDFMLP()
    model = train(model, coords, sdf)

    torch.save(model.state_dict(), args.out)
    print(f"Model saved to {args.out}")

if __name__ == '__main__':
    main()